from app import db

class Income(db.Model):
    __tablename__ = 'income'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    source = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text) 
    date = db.Column(db.Date, nullable=False)
    recurring = db.Column(db.String(20), default='No') 
    payment_method = db.Column(db.String(50)) 
    notes = db.Column(db.Text)
