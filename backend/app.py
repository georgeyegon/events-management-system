from flask import Flask, request, jsonify, session
from flask_cors import CORS
from models import db, User, Event, Booking
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError
from datetime import datetime
from werkzeug.security import check_password_hash
from config import SECRET_KEY
import jwt

# Initialize flask app
app = Flask(__name__)
# Set the correct database URI
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///events.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
# Set the secret key for Flask and JWT
app.config['SECRET_KEY'] = SECRET_KEY
app.config['JWT_SECRET_KEY'] = SECRET_KEY  # Use the same key for JWT

# Initialize the dependencies
CORS(app)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)
db.init_app(app)
migrate = Migrate(app, db)


@app.route('/users', methods=['POST'])
def register_user():
    try:
        data = request.get_json()

        if not data.get('username') or not data.get('password'):
            return jsonify({"error": "Username and password are required"}), 400

        existing_user = User.query.filter_by(username=data['username']).first()
        if existing_user:
            return jsonify({"error": "Username already exists"}), 400

        # Hash the password before saving (use bcrypt)
        hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')

        # Create a new user object
        new_user = User(
            username=data['username'],
            image_url=data.get('image_url', ''),
            password=hashed_password,
            isAdmin=data.get('isAdmin', False)
        )

        # Add the user to the database
        db.session.add(new_user)
        db.session.commit()

        # Return a success message
        return jsonify({"message": "User registered successfully"}), 201

    except IntegrityError as e:
        db.session.rollback()  # Rollback the session in case of errors
        return jsonify({"error": "Database error: User might already exist."}), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/login", methods=["POST"])
def login():
    username = request.json.get('username', None)
    password = request.json.get('password', None)

    user = User.query.filter_by(username=username).first()

    if user and user.check_password(password):
        access_token = create_access_token(identity=user.id)
        return jsonify({
            "access_token": access_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "isAdmin": user.isAdmin,  # Ensure this is part of the response
                "image_url": user.image_url
            }
        }), 200

    return jsonify({"msg": "Invalid credentials"}), 401


@app.route('/admin/add_event', methods=['POST'])
@jwt_required()
def create_event():
    # Get current user from JWT
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user or not user.isAdmin:  # Check if the user exists and has isadmin == True
        return jsonify({"msg": "Admin privileges required"}), 403

    # Get request data
    event_data = request.get_json()

    # Validate required fields
    required_fields = ['title', 'description', 'date', 'location']
    if not all(field in event_data for field in required_fields):
        return jsonify({"msg": "Missing required fields"}), 400

    try:
        event_date = datetime.fromisoformat(event_data['date'].replace('Z', '+00:00'))
    except ValueError:
        return jsonify({"msg": "Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"}), 400

    # Create new event
    new_event = Event(
        title=event_data['title'],
        image_url=event_data.get('image_url'),
        description=event_data['description'],
        date=event_date,
        location=event_data['location'],
        admin_id=user.id
    )

    db.session.add(new_event)
    db.session.commit()

    return jsonify({
        "msg": "Event created successfully",
        "event": new_event.to_dict()
    }), 201

@app.route('/events', methods=['GET'])
def get_events():
    events = Event.query.all()

    # Return only necessary fields
    return jsonify([event.to_dict() for event in events]), 200

@app.route('/events/<int:event_id>', methods=['PUT'])
def update_event(event_id):
    try:
        # Get the data from the request
        data = request.get_json()

        # Find the event by ID
        event = Event.query.get(event_id)
        
        if not event:
            return jsonify({"error": "Event not found"}), 404

        # Update the event fields
        event.title = data.get('title', event.title)
        event.image_url = data.get('image_url', event.image_url)
        event.description = data.get('description', event.description)
        event.location = data.get('location', event.location)

        # Convert date string to Python datetime object
        if 'date' in data:
            try:
                event.date = datetime.strptime(data['date'], "%Y-%m-%dT%H:%M:%S")  # Ensure correct format
            except ValueError:
                return jsonify({"error": "Invalid date format. Use 'YYYY-MM-DDTHH:MM:SS'"}), 400

        # Commit the changes to the database
        db.session.commit()

        # Return the updated event
        return jsonify({
            "id": event.id,
            "title": event.title,
            "image_url": event.image_url,
            "description": event.description,
            "date": event.date.isoformat(),  # Convert back to ISO format for response
            "location": event.location,
            "admin_id": event.admin_id
        }), 200

    except Exception as e:
        db.session.rollback()  # Rollback the session in case of errors
        return jsonify({"error": str(e)}), 500

@app.route("/admin/events", methods=["GET"])
@jwt_required()
def get_admin_events():
    try:
        # Get the current logged-in user's ID from the JWT and cast it to string
        current_user_id = str(get_jwt_identity())

        # Debugging: Ensure current_user_id is a string
        print(f"current_user_id: {current_user_id}, type: {type(current_user_id)}")

        # Ensure the user is an admin by checking the 'role' field
        admin = User.query.filter_by(id=current_user_id, role=True).first()
        if not admin:
            return jsonify({"msg": "Unauthorized, only admins can access this route"}), 403

        # Fetch events created by the admin
        events = Event.query.filter_by(admin_id=int(current_user_id)).all()

        return jsonify([event.to_dict() for event in events]), 200
    except Exception as e:
        return jsonify({"msg": "An error occurred", "error": str(e)}), 500



@app.route("/my-account", methods=["GET"])
@jwt_required()
def get_user_account():
    try:
        # Get the current logged-in user's ID from the JWT
        current_user_id = get_jwt_identity()

        # Fetch the user from the database
        user = User.query.get(current_user_id)

        if not user:
            return jsonify({"msg": "User not found"}), 404

        # Fetch all bookings for the current user
        bookings = Booking.query.filter_by(user_id=current_user_id).all()

        # Get event details for each booking
        booked_events = []
        for booking in bookings:
            event = Event.query.get(booking.event_id)
            if event:
                booked_events.append(event.to_dict())

        user_data = {
            "id": user.id,
            "username": user.username,
            "image_url": user.image_url,
            "booked_events": booked_events,
        }

        return jsonify(user_data), 200

    except Exception as e:
        return jsonify({"msg": "An error occurred", "error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
