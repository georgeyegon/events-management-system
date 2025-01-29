from flask import Flask
from flask_migrate import Migrate
from flask_restful import Api, Resource
from models import db
app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///events.db'
app.config['SQLACHEMY_TRACK_MODIFICATION'] = False

migrate = Migrate(app, db)

db.init_app(app)

api = Api(app)
