from flask import session
from flask_socketio import emit, join_room, leave_room
from .. import socketio
import time
from pymongo import MongoClient

@socketio.on('joined', namespace='/chat')
def joined(message):
    """Sent by clients when they enter a room.
    A status message is broadcast to all people in the room."""
    room = session.get('room')
    id = message["id"]
    date = message["date"]
    mid = session.get('mid')
    join_room(room)


    """Load chat history and broadcast to the user that just joined"""
    #load history
    #save to mongo
    client = MongoClient("mongodb+srv://save_info:1234@europe-gcp.opnab.mongodb.net/chat?retryWrites=true&w=majority")

    #sort by descending order of creation

    #get chatroom info

    db = client.get_database("chat_rooms")
    chat = db["chat_rooms"]
    query = {"roomId": room, "mid" : {"$ne": int(mid)}}
    chat_rooms = db["chat_rooms"]
    chat_room = list(chat_rooms.find(query, {'_id': False}).limit(1))[0]
    partner_name = chat_room["name"]
    partner_mid = chat_room["mid"]

    query = {"roomId": room, "mid" : int(mid)}
    chat_room = list(chat_rooms.find(query, {'_id': False}).limit(1))[0]
    chat_link = chat_room["chat_link"]

    emit('details', {'roomId': room, "name": session.get("name"), "mid": int(mid), "chat_link":chat_link, "partner_name": partner_name, "partner_mid": partner_mid}, room=id)

    db = client.get_database("chat")
    chat = db["chat"]
    query = {"roomId": room}

    chatHistory = list(chat.find(query, {'_id': False}).limit(50))
    if len(chatHistory) > 0:
        #load chat history

        emit('chatHistory', {'chatHistory': chatHistory}, room=id)


        #delete all scheduled notifications to this user in this chatroom
        scheduler = db["scheduler"]
        query = {"receiver": int(mid)}
        scheduler.delete_many(query)



@socketio.on('proposal', namespace='/chat')
def proposal(message):
    #save to mongo
    client = MongoClient("mongodb+srv://save_info:1234@europe-gcp.opnab.mongodb.net/chat?retryWrites=true&w=majority")
    db = client.get_database("chat")
    chat = db["chat"]
    room = session.get('room')
    name = session.get('name')
    mid = session.get('mid')
    #send notification
    #get the receiver mid
    receiver = 0

    if room.find(str(mid)) > 0:
        receiver = int(room.split("_")[0])
    else:
        receiver = int(room.split("_")[1])
    now = time.time()

    try:
        last_timestamp = list(chat.find({"roomId": room, "mid": int(mid)}).sort([{"_id",-1}]).limit(1))[0]["timestamp"]
    except:
        #if last message doesn't exist
        last_timestamp = 0

    chat.insert_one(message)
    message.pop("_id",None)
    emit('game', message)

    data = {
    "sender": int(mid),
    "receiver": receiver,
    "message": name + " t'a proposé un créneau.",
    "roomId": room,
    "timestamp": now,
    }

    #notify if longer than 30 min since last chat
    scheduler = db["scheduler"]
    if now - last_timestamp >= 1800:
        #send notification
        import requests
        import json
        url = "https://europe-west1-wildcard-b00.cloudfunctions.net/FR_chat_notification"
        # print(json.dumps(data))
        response = requests.post(url, json=data)

        # delete any notifications to be sent to receiver since we are sending one here
        scheduler.delete_many({"receiver": receiver})
        # print(response)
    elif now - last_timestamp >= 0:

    #otherwise, send to scheduler collection to schedule a notification if user doesn't reconnect
        # print("loading to scheduler")
        scheduler.replace_one({"sender": int(mid), "roomId": room}, data, upsert=True)

@socketio.on('text', namespace='/chat')
def text(message):
    """Sent by a client when the user entered a new message.
    The message is sent to all people in the room."""

    room = session.get('room')
    mid = session.get('mid')
    msgToSend = session.get('name') + ' ]____[ ' + message['msg'] +  " ]____[ " + str(mid)
    emit('message', {'msg': msgToSend}, room=room)

    #save to mongo
    client = MongoClient("mongodb+srv://save_info:1234@europe-gcp.opnab.mongodb.net/chat?retryWrites=true&w=majority")
    db = client.get_database("chat")
    chat = db["chat"]

    #get latest message by this sender's  timestamp this will be used to send notification if last message is old

    try:
        last_timestamp = list(chat.find({"roomId": room, "mid": int(mid)}).sort([{"_id",-1}]).limit(1))[0]["timestamp"]
    except:
        #if last message doesn't exist
        last_timestamp = 0

    now = time.time()

    query = {"type":"text", "mid": int(mid), "roomId": room, "message":msgToSend, "timestamp": now, "localDate": message['date']}
    chat.insert_one(query)

    #send notification
    #get the receiver mid
    receiver = 0

    if room.find(str(mid)) > 0:
        receiver = int(room.split("_")[0])
    else:
        receiver = int(room.split("_")[1])

    data = {
    "sender": int(mid),
    "receiver": receiver,
    "message": message['msg'],
    "roomId": room,
    "timestamp": now
    }

    #notify if longer than 30 min since last chat
    scheduler = db["scheduler"]
    if now - last_timestamp >= 1800:
        #send notification
        import requests
        import json
        url = "https://europe-west1-wildcard-b00.cloudfunctions.net/FR_chat_notification"
        # print(json.dumps(data))
        response = requests.post(url, json=data)

        # delete any notifications to be sent to receiver since we are sending one here
        scheduler.delete_many({"receiver": receiver})
        # print(response)
    elif now - last_timestamp >= 0:
    #otherwise, send to scheduler collection to schedule a notification if user doesn't reconnect
        # print("loading to scheduler")

        scheduler.replace_one({"sender": int(mid), "roomId": room}, data, upsert=True)






@socketio.on('left', namespace='/chat')
def left(message):
    """Sent by clients when they leave a room.
    A status message is broadcast to all people in the room."""
    room = session.get('room')
    leave_room(room)
    emit('status', {'msg': session.get('name') + ' s\'est déconnecté.'}, room=room)

# @socketio.on('disconnect', namespace='/chat')
# def disconnect():
#     """Sent by clients when they leave a room.
#     A status message is broadcast to all people in the room."""
#     room = session.get('room')
#     leave_room(room)
#     emit('status', {'msg': session.get('name') + ' s\'est déconnecté.'}, room=room)
