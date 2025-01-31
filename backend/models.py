from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from sqlalchemy_serializer import SerializerMixin
from flask_bcrypt import Bcrypt

metadata = MetaData
db = SQLAlchemy()
bcrypt = Bcrypt()

class User(db.Model, SerializerMixin):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False, unique=True)
    image_url = db.Column(db.String(255), nullable=True)  
    password = db.Column(db.String(128), nullable=False)
    isAdmin = db.Column(db.Boolean, default=False) 

    # Relationships
    events_created = db.relationship('Event', back_populates='admin', cascade='all, delete')
    bookings = db.relationship('Booking', back_populates='user', cascade='all, delete')

    def __repr__(self):
        return f'<User {self.username}>'

    def check_password(self, password):
        """Check if the given password matches the hashed password."""
        return bcrypt.check_password_hash(self.password, password)

class Event(db.Model):
    __tablename__ = 'events'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    image_url = db.Column(db.String(255), nullable=True)
    description = db.Column(db.Text, nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    location = db.Column(db.String(200), nullable=False)
    admin_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)

    # Relationships
    admin = db.relationship('User', back_populates='events_created')
    bookings = db.relationship('Booking', back_populates='event', cascade='all, delete')

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "image_url": self.image_url,
            "description": self.description,
            "date": self.date.isoformat() if self.date else None,
            "location": self.location,
            "admin_id": self.admin_id  # Avoid serializing `admin` directly
        }

    def __repr__(self):
        return f'<Event {self.title}>'

class Booking(db.Model, SerializerMixin):
    __tablename__ = 'bookings'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    number_of_tickets = db.Column(db.Integer, nullable=False)  

    # Relationships
    user = db.relationship('User', back_populates='bookings')
    event = db.relationship('Event', back_populates='bookings')

    def __repr__(self):
        return f'<Booking User {self.user_id} Event {self.event_id}>'

