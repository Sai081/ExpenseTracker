import os
import time
import base64
import secrets
from datetime import date
from flask import Blueprint, request, current_app
from flask_login import login_user, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
from app.models.user import User
from app.routes.api import success_response, error_response, api_login_required

auth_api_bp = Blueprint('auth_api', __name__, url_prefix='/auth')

@auth_api_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password')
    username = (data.get('username') or '').strip()

    if not email or not password:
        return error_response("Email and password are required", status_code=400)

    if not username:
        username = email.split('@')[0]

    existing_user = User.query.filter((User.email == email) | (User.username == username)).first()
    if existing_user:
        if existing_user.email == email:
            return error_response("Email is already registered", status_code=409)
        return error_response("Username is already taken", status_code=409)

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256', salt_length=16)
    new_user = User(
        username=username,
        email=email,
        password=hashed_password
    )

    try:
        db.session.add(new_user)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to register user: {str(e)}", status_code=500)

    login_user(new_user)

    return success_response(
        data={
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email,
            "avatar_url": new_user.avatar_url,
            "is_google": False,
            "has_password": True
        },
        message="Registration successful",
        status_code=201
    )

@auth_api_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password')
    remember = bool(data.get('remember', False))

    if not email or not password:
        return error_response("Email and password are required", status_code=400)

    user = User.query.filter_by(email=email).first()
    if not user or not user.password or not check_password_hash(user.password, password):
        return error_response("Invalid email or password", status_code=401)

    login_user(user, remember=remember)

    return success_response(
        data={
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "avatar_url": user.avatar_url,
            "is_google": bool(user.supabase_id or user.password is None),
            "has_password": user.password is not None
        },
        message=f"Welcome back, {user.username}!"
    )

@auth_api_bp.route('/google', methods=['POST'])
def google_auth():
    data = request.get_json() or {}
    email = (data.get('email') or '').strip().lower()
    name = (data.get('name') or data.get('username') or '').strip()
    avatar_url = data.get('avatar_url') or data.get('picture')

    if not email:
        return error_response("Google account email is required", status_code=400)

    user = User.query.filter_by(email=email).first()
    if not user:
        username = name or email.split('@')[0]
        base_username = username.replace(' ', '_').lower()
        candidate = base_username
        counter = 1
        while User.query.filter_by(username=candidate).first():
            candidate = f"{base_username}_{counter}"
            counter += 1

        user = User(
            username=candidate,
            email=email,
            supabase_id=f"google_{secrets.token_hex(8)}",
            password=None,
            avatar_url=avatar_url or f"https://api.dicebear.com/7.x/initials/svg?seed={email}"
        )
        try:
            db.session.add(user)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return error_response(f"Failed to create Google account user: {str(e)}", status_code=500)
    else:
        if not user.supabase_id:
            user.supabase_id = f"google_{secrets.token_hex(8)}"
        if avatar_url and not user.avatar_url:
            user.avatar_url = avatar_url
        db.session.commit()

    login_user(user, remember=True)
    return success_response(
        data={
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "avatar_url": user.avatar_url,
            "is_google": True,
            "has_password": False
        },
        message=f"Signed in as {user.username} via Google"
    )

@auth_api_bp.route('/logout', methods=['POST'])
@api_login_required
def logout():
    logout_user()
    return success_response(message="Logged out successfully")

@auth_api_bp.route('/me', methods=['GET'])
@api_login_required
def get_me():
    if not current_user.is_authenticated:
        return error_response("Not authenticated", status_code=401)

    is_google = bool(current_user.supabase_id or current_user.password is None)
    has_password = current_user.password is not None

    return success_response(data={
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "avatar_url": current_user.avatar_url,
        "created_at": current_user.created_at.strftime("%Y-%m-%d") if current_user.created_at else None,
        "is_google": is_google,
        "has_password": has_password
    })

@auth_api_bp.route('/profile', methods=['PUT'])
@api_login_required
def update_profile():
    data = request.get_json() or {}
    new_username = (data.get('username') or '').strip()
    new_avatar = data.get('avatar_url')

    if new_username and new_username != current_user.username:
        existing = User.query.filter(User.username == new_username, User.id != current_user.id).first()
        if existing:
            return error_response("Username is already taken by another user", status_code=409)
        current_user.username = new_username

    if new_avatar is not None:
        if isinstance(new_avatar, str) and new_avatar.startswith('data:image/'):
            try:
                header, encoded = new_avatar.split(',', 1)
                img_data = base64.b64decode(encoded)
                ext = 'png'
                if 'jpeg' in header or 'jpg' in header:
                    ext = 'jpg'
                elif 'webp' in header:
                    ext = 'webp'

                upload_dir = os.path.join(current_app.root_path, 'static', 'uploads')
                os.makedirs(upload_dir, exist_ok=True)
                filename = f"avatar_{current_user.id}.{ext}"
                filepath = os.path.join(upload_dir, filename)
                with open(filepath, 'wb') as f:
                    f.write(img_data)

                current_user.avatar_url = f"/static/uploads/{filename}?v={int(time.time())}"
            except Exception as e:
                print(f"[Avatar Save Warning] {e}")
                current_user.avatar_url = new_avatar
        else:
            current_user.avatar_url = new_avatar

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to update profile: {str(e)}", status_code=500)

    is_google = bool(current_user.supabase_id or current_user.password is None)
    has_password = current_user.password is not None

    return success_response(
        data={
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "avatar_url": current_user.avatar_url,
            "created_at": current_user.created_at.strftime("%Y-%m-%d") if current_user.created_at else None,
            "is_google": is_google,
            "has_password": has_password
        },
        message="Profile updated successfully"
    )

@auth_api_bp.route('/change-password', methods=['POST'])
@api_login_required
def change_password():
    if current_user.password is None or current_user.supabase_id:
        return error_response("Password reset is not available for Google Sign-In accounts. Your security is managed by Google.", status_code=400)

    data = request.get_json() or {}
    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')

    if not current_password or not new_password:
        return error_response("Current password and new password are required", status_code=400)

    if len(new_password) < 6:
        return error_response("New password must be at least 6 characters long", status_code=400)

    if not check_password_hash(current_user.password, current_password):
        return error_response("Current password is incorrect", status_code=401)

    current_user.password = generate_password_hash(new_password, method='pbkdf2:sha256', salt_length=16)
    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to update password: {str(e)}", status_code=500)

    return success_response(message="Password changed successfully")

@auth_api_bp.route('/demo', methods=['POST'])
def demo_login():
    demo_email = "demo@expensetracker.local"
    user = User.query.filter_by(email=demo_email).first()
    if not user:
        user = User(
            username="Alex Rivera",
            email=demo_email,
            password=generate_password_hash("DemoSecret123!", method='pbkdf2:sha256', salt_length=16),
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop"
        )
        db.session.add(user)
        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            user = User.query.filter_by(email=demo_email).first()

    if user:
        # Check if demo user needs initial transactions seeded
        from app.models import Transaction, Budget, Category
        today = date.today()
        month_str = today.strftime("%Y-%m")

        existing_txns = Transaction.query.filter_by(user_id=user.id).count()
        if existing_txns == 0:
            food_cat = Category.query.filter_by(name="Food & Dining").first()
            if not food_cat:
                food_cat = Category(name="Food & Dining", type="expense", user_id=None)
                db.session.add(food_cat)
            salary_cat = Category.query.filter_by(name="Salary").first()
            if not salary_cat:
                salary_cat = Category(name="Salary", type="income", user_id=None)
                db.session.add(salary_cat)
            grocery_cat = Category.query.filter_by(name="Groceries").first()
            if not grocery_cat:
                grocery_cat = Category(name="Groceries", type="expense", user_id=None)
                db.session.add(grocery_cat)
            db.session.commit()

            if salary_cat:
                db.session.add(Transaction(
                    user_id=user.id,
                    type='income',
                    amount=85000.0,
                    category_id=salary_cat.id,
                    description="Monthly Tech Consulting Credit",
                    date=today,
                    payment_method='bank_transfer'
                ))
            if food_cat:
                db.session.add(Transaction(
                    user_id=user.id,
                    type='expense',
                    amount=750.0,
                    category_id=food_cat.id,
                    description="Team Lunch with Friends",
                    date=today,
                    payment_method='upi'
                ))
                db.session.add(Budget(user_id=user.id, category_id=food_cat.id, amount=7500.0, month=month_str))
            if grocery_cat:
                db.session.add(Transaction(
                    user_id=user.id,
                    type='expense',
                    amount=1240.0,
                    category_id=grocery_cat.id,
                    description="Weekly Supermarket Groceries",
                    date=today,
                    payment_method='upi'
                ))
            try:
                db.session.commit()
            except Exception:
                db.session.rollback()

    login_user(user, remember=True)
    return success_response(
        data={
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "avatar_url": user.avatar_url,
            "token": "demo_token",
            "is_google": False,
            "has_password": True
        },
        message="Logged in as Demo User"
    )

@auth_api_bp.route('/account', methods=['DELETE'])
@api_login_required
def delete_account():
    user = current_user
    try:
        from app.models import Transaction, Budget, Category
        Transaction.query.filter_by(user_id=user.id).delete()
        Budget.query.filter_by(user_id=user.id).delete()
        Category.query.filter_by(user_id=user.id).delete()
        db.session.delete(user)
        db.session.commit()
        logout_user()
        return success_response(message="Account and all associated records deleted successfully")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to delete account: {str(e)}", status_code=500)

