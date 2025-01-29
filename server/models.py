from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from sqlalchemy_serializer import SerializerMixin

metadata = MetaData
db = SQLAlchemy()

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False, unique=True)
    password = db.Column(db.String(128), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)  # Determines if the user is an admin

    # Relationships
    events_created = db.relationship('Event', back_populates='admin', cascade='all, delete')
    bookings = db.relationship('Booking', back_populates='user', cascade='all, delete')

    def __repr__(self):
        return f'<User {self.username}>'
class Event(db.Model, SerializerMixin):
    __tablename__ = 'events'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(200), nullable=False)

    # Foreign Key
    admin_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Relationships
    admin = db.relationship('User', back_populates='events_created')
    bookings = db.relationship('Booking', back_populates='event', cascade='all, delete')

    def __repr__(self):
        return f'<Event {self.title}>'
class Booking(db.Model, SerializerMixin):
    __tablename__ = 'bookings'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    number_of_tickets = db.Column(db.Integer, nullable=False)  # User-submittable attribute

    # Relationships
    user = db.relationship('User', back_populates='bookings')
    event = db.relationship('Event', back_populates='bookings')

    def __repr__(self):
        return f'<Booking User {self.user_id} Event {self.event_id}>'

