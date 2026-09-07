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
    print(f"Starting ExpenseTracker on http://127.0.0.1:{port}")
    app.run(debug=True, port=port)
