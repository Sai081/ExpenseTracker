from datetime import datetime
from app import db

class Transaction(db.Model):
    __tablename__ = "transaction"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    type = db.Column(db.String(10), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey("category.id", ondelete="SET NULL"), nullable=True)
    description = db.Column(db.String(255))
    date = db.Column(db.Date, nullable=False)
    payment_method = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates="transactions")
    category = db.relationship("Category", back_populates="transactions")
