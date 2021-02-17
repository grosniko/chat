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
    join_room(room)


    """Load chat history and broadcast to the user that just joined"""
    #load history
    #save to mongo
    client = MongoClient("mongodb+srv://save_info:1234@europe-gcp.opnab.mongodb.net/chat?retryWrites=true&w=majority")
    db = client.get_database("chat")
    chat = db["chat"]
    #sort by descending order of creation
    sort = {'timestamp': -1}

    query = {"roomId": room}
    chatHistory = list(chat.find(query, {'_id': False}).limit(50))
    if len(chatHistory) > 0:
        emit('chatHistory', {'chatHistory': chatHistory}, room=id)


    game = session.get('game')
    #if there is a game proposal
    if len(game)>2:
        emit('game', {'message': session.get('name') + ' accepte le RDV tennis suivant: ', 'game': game}, room=room)
        query = {"type":"proposal", "roomId": room, "message":session.get('name') + ' accepte le RDV tennis suivant: ', "timestamp": time.time(), 'game': game, "localDate": date}
        chat.insert_one(query)

    # emit('status', {'msg': session.get('name') + ' est en ligne.'}, room=room)


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
    query = {"type":"text", "roomId": room, "message":msgToSend, "timestamp": time.time(), "localDate": message['date']}
    chat.insert_one(query)


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
