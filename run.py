import os
from app import create_app, db

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        try:
            db.create_all()
        except Exception as e:
            print(f"Database table check notice: {e}")
    port = int(os.getenv('PORT', 5001))
    debug_mode = os.getenv('FLASK_DEBUG', 'true').lower() in ('true', '1')
    print(f"Starting ExpenseTracker API backend on http://127.0.0.1:{port} (Debug: {debug_mode})")
    app.run(host='0.0.0.0', port=port, debug=debug_mode)
