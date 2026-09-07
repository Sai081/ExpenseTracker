import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_cors import CORS
from dotenv import load_dotenv

db = SQLAlchemy()
login_manager = LoginManager()

load_dotenv()

def create_app():
    app = Flask(__name__)
    # Configure CORS with explicit allowed origins to support credentialed requests
    allowed_origins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5000',
        'http://127.0.0.1:5000',
        'http://localhost:5001',
        'http://127.0.0.1:5001',
        'http://localhost:3000',
        'http://127.0.0.1:3000',
    ]
    frontend_url = os.getenv('FRONTEND_URL', '')
    if frontend_url:
        for url in frontend_url.split(','):
            cleaned = url.strip().rstrip('/')
            if cleaned and cleaned not in allowed_origins:
                allowed_origins.append(cleaned)

    additional_origins = os.getenv('ALLOWED_ORIGINS', '')
    if additional_origins:
        for origin in additional_origins.split(','):
            cleaned = origin.strip().rstrip('/')
            if cleaned and cleaned not in allowed_origins:
                allowed_origins.append(cleaned)

    CORS(
        app,
        resources={r"/api/*": {"origins": allowed_origins}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "X-Groq-Api-Key"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
    )
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-12345')

    db_url = os.getenv('DATABASE_URL', '')
    if db_url.startswith('postgres://'):
        db_url = db_url.replace('postgres://', 'postgresql://', 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    login_manager.init_app(app)

    from app.models.user import User
    from app.routes.api import api_bp
    from app.routes.export_routes import export_bp
    from app.routes.home_routes import home_bp

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    app.register_blueprint(api_bp)
    app.register_blueprint(export_bp)
    app.register_blueprint(home_bp)

    return app
