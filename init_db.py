import sys
from app import create_app, db
from app.models.category import Category

DEFAULT_CATEGORIES = [
    # Expenses
    {"name": "Food & Dining", "type": "expense"},
    {"name": "Groceries", "type": "expense"},
    {"name": "Transportation", "type": "expense"},
    {"name": "Housing & Rent", "type": "expense"},
    {"name": "Utilities & Bills", "type": "expense"},
    {"name": "Entertainment & Leisure", "type": "expense"},
    {"name": "Healthcare & Fitness", "type": "expense"},
    {"name": "Shopping", "type": "expense"},
    {"name": "Education", "type": "expense"},
    {"name": "Personal Care", "type": "expense"},
    {"name": "Miscellaneous", "type": "expense"},
    # Incomes
    {"name": "Salary", "type": "income"},
    {"name": "Freelance & Consulting", "type": "income"},
    {"name": "Investments & Dividends", "type": "income"},
    {"name": "Gifts & Bonuses", "type": "income"},
    {"name": "Other Income", "type": "income"}
]

def init_database():
    app = create_app()
    with app.app_context():
        db_uri = app.config.get('SQLALCHEMY_DATABASE_URI', '')
        # Mask password in log output
        display_uri = db_uri
        if '@' in display_uri:
            prefix, rest = display_uri.split('@', 1)
            if '://' in prefix and ':' in prefix.split('://', 1)[1]:
                proto, creds = prefix.split('://', 1)
                user = creds.split(':', 1)[0]
                display_uri = f"{proto}://{user}:****@{rest}"

        print(f"Connecting to database: {display_uri}")

        try:
            db.create_all()
            print("✓ Database tables created successfully.")
        except Exception as e:
            print(f"✗ Failed to create tables: {str(e)}")
            sys.exit(1)

        # Seed default categories (categories with user_id = None)
        added_count = 0
        for cat_info in DEFAULT_CATEGORIES:
            existing = Category.query.filter_by(name=cat_info["name"]).first()
            if not existing:
                cat = Category(
                    name=cat_info["name"],
                    type=cat_info["type"],
                    user_id=None
                )
                db.session.add(cat)
                added_count += 1

        if added_count > 0:
            db.session.commit()
            print(f"✓ Seeded {added_count} default categories.")
        else:
            print("✓ Default categories already present.")

        print("✓ Database initialization complete!")

if __name__ == '__main__':
    init_database()
