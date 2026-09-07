from app import db

class Category(db.Model):
    __tablename__ = "category"
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    type = db.Column(db.String(20), nullable=False, default="expense")
    user_id = db.Column(db.Integer, db.ForeignKey("user.id", ondelete="CASCADE"), nullable=True)

    user = db.relationship("User", back_populates="categories")
    transactions = db.relationship("Transaction", back_populates="category")

    __table_args__ = (
        db.UniqueConstraint("user_id", "name", name="uq_user_category_name"),
    )
