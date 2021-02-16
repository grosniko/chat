from flask_wtf import Form
from wtforms.fields import StringField, SubmitField
from wtforms.validators import Required


class LoginForm(Form):
    """Accepts a nickname and a room."""
    name = StringField('Name', validators=[Required()])
    mid = StringField('mid', validators=[Required()])
    room = StringField('Room', validators=[Required()])
    game = StringField('game', validators=[Required()])
    submit = SubmitField('Chatter')
