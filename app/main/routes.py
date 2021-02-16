from flask import session, redirect, url_for, render_template, request
from . import main
from .forms import LoginForm


@main.route('/', methods=['GET', 'POST'])
def index():
    """Login form to enter a room."""
    form = LoginForm()
    if form.validate_on_submit():
        session['name'] = form.name.data
        session['mid'] = form.mid.data
        session['room'] = form.room.data
        session['game'] = form.game.data
        return redirect(url_for('.chat'))
    elif request.method == 'GET':
        form.name.data = session.get('name', '')
        form.mid.data = session.get('mid', '')
        form.room.data = session.get('room', '')
        form.game.data = session.get('game', '')
    return render_template('index.html', form=form)


@main.route('/chat')
def chat():
    """Chat room. The user's name and room must be stored in
    the session."""
    name = session.get('name', '')
    mid = session.get('mid', '')
    room = session.get('room', '')
    game = session.get('game', '')
    if name == '' or room == '':
        return redirect(url_for('.index'))
    return render_template('chat.html', name=name, room=room, mid=mid, game=game)