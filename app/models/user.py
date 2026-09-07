from app import db
from flask_login import UserMixin

class User(UserMixin, db.Model):
    __tablename__ = "user"
    
    id = db.Column(db.Integer, primary_key=True)
    supabase_id = db.Column(db.String(64), unique=True, index=True, nullable=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=True)
    avatar_url = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    transactions = db.relationship("Transaction", back_populates="user", cascade="all, delete-orphan")
    categories = db.relationship("Category", back_populates="user", cascade="all, delete-orphan")
