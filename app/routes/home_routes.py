import os
from flask import Blueprint, send_from_directory, abort, jsonify

home_bp = Blueprint('home', __name__)

@home_bp.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "ExpenseTracker API"}), 200

@home_bp.route('/', defaults={'path': ''}, endpoint='home')
@home_bp.route('/<path:path>', endpoint='serve_spa')
def home(path=''):
    if path.startswith('api/') or path.startswith('static/'):
        abort(404)

    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    dist_dir = os.path.join(base_dir, 'frontend', 'dist')

    if os.path.exists(dist_dir):
        target = os.path.join(dist_dir, path)
        if path != "" and os.path.isfile(target):
            return send_from_directory(dist_dir, path)
        index_file = os.path.join(dist_dir, 'index.html')
        if os.path.isfile(index_file):
            return send_from_directory(dist_dir, 'index.html')

    # If dist directory is not present (e.g. backend-only container on Render),
    # return API status at root so deployment health checks succeed.
    if path == "":
        return jsonify({
            "status": "online",
            "service": "ExpenseTracker API",
            "api": "/api",
            "health": "/health"
        }), 200

    return "Frontend distribution not found. Please run 'npm run build' inside frontend.", 404
