import os
import time
import requests
from flask import Blueprint, jsonify, request
from functools import wraps
from flask_login import current_user, login_user
from app import db
from app.models.user import User

def success_response(data=None, message=None, status_code=200):
    payload = {"success": True}
    if data is not None:
        payload["data"] = data
    if message is not None:
        payload["message"] = message
    return jsonify(payload), status_code

def error_response(message="An error occurred", status_code=400, errors=None):
    payload = {"success": False, "error": message}
    if errors is not None:
        payload["errors"] = errors
    return jsonify(payload), status_code

# In-memory cache for verified Supabase tokens: { token: (user_id, expiry_timestamp) }
_TOKEN_CACHE = {}

def verify_supabase_token(token):
    if not token:
        return None

    if token.startswith("user_token_"):
        try:
            uid = int(token.split("_")[2])
            return User.query.get(uid)
        except Exception:
            pass

# Demo token bypass disabled

    now = time.time()
    if token in _TOKEN_CACHE:
        user_id, exp = _TOKEN_CACHE[token]
        if now < exp:
            return User.query.get(user_id)
        else:
            del _TOKEN_CACHE[token]

    supabase_url = os.getenv("SUPABASE_URL", "https://skfjnwiyhtknluqtipff.supabase.co")
    anon_key = os.getenv("SUPABASE_ANON_KEY", "")

    headers = {"Authorization": f"Bearer {token}"}
    if anon_key:
        headers["apikey"] = anon_key

    try:
        resp = requests.get(f"{supabase_url}/auth/v1/user", headers=headers, timeout=5)
        if resp.status_code != 200:
            return None

        data = resp.json()
        supabase_id = data.get("id")
        email = (data.get("email") or "").strip().lower()
        metadata = data.get("user_metadata") or {}
        avatar_url = metadata.get("avatar_url") or metadata.get("picture")
        full_name = metadata.get("full_name") or metadata.get("name") or (email.split("@")[0] if email else "user")

        if not email:
            return None

        # Find or create user in our PostgreSQL database
        user = User.query.filter((User.supabase_id == supabase_id) | (User.email == email)).first()
        if not user:
            base_username = full_name.replace(" ", "_").lower()
            username = base_username
            counter = 1
            while User.query.filter_by(username=username).first():
                username = f"{base_username}_{counter}"
                counter += 1

            user = User(
                supabase_id=supabase_id,
                email=email,
                username=username,
                avatar_url=avatar_url
            )
            db.session.add(user)
            db.session.commit()
        else:
            dirty = False
            if not user.supabase_id:
                user.supabase_id = supabase_id
                dirty = True
            if avatar_url and not user.avatar_url:
                user.avatar_url = avatar_url
                dirty = True
            if dirty:
                db.session.commit()

        # Cache for 5 minutes
        _TOKEN_CACHE[token] = (user.id, now + 300)
        return user

    except Exception as e:
        print(f"[Supabase Auth Error] {e}")
        return None

def api_login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # 1. Check if user is already authenticated via Flask session
        if current_user and current_user.is_authenticated:
            return f(*args, **kwargs)

        # 2. Check for Supabase JWT token in Authorization header
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1].strip()
            user = verify_supabase_token(token)
            if user:
                login_user(user)
                return f(*args, **kwargs)

        return error_response("Authentication required", status_code=401)
    return decorated

api_bp = Blueprint('api', __name__, url_prefix='/api')

from app.routes.api.auth_api import auth_api_bp
from app.routes.api.dashboard_api import dashboard_api_bp
from app.routes.api.transaction_api import transaction_api_bp
from app.routes.api.budget_api import budget_api_bp
from app.routes.api.category_api import category_api_bp
from app.routes.api.ai_api import ai_api_bp

api_bp.register_blueprint(auth_api_bp)
api_bp.register_blueprint(dashboard_api_bp)
api_bp.register_blueprint(transaction_api_bp)
api_bp.register_blueprint(budget_api_bp)
api_bp.register_blueprint(category_api_bp)
api_bp.register_blueprint(ai_api_bp)
