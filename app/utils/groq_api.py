import os
import requests
from flask_login import current_user
from app.models import Expense, Income, Transaction, Budget, Category
from sqlalchemy import func, extract
from app import db
from datetime import datetime

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL_NAME = "llama-3.1-8b-instant"

def get_groq_api_key():
    key = os.getenv("GROQ_API_KEY")
    if key:
        return key.strip().strip('"').strip("'")
    return None

def get_user_financial_summary(user_id):
    now = datetime.now()

    # Lifetime Totals from Transaction (fallback to Expense/Income)
    total_expense = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.type == 'expense'
    ).scalar()
    if total_expense is None:
        total_expense = db.session.query(func.sum(Expense.amount)).filter_by(user_id=user_id).scalar() or 0
    total_expense = abs(float(total_expense or 0))

    total_income = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.type == 'income'
    ).scalar()
    if total_income is None:
        total_income = db.session.query(func.sum(Income.amount)).filter_by(user_id=user_id).scalar() or 0
    total_income = float(total_income or 0)

    # Monthly Expenses
    monthly_expense = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.type == 'expense',
        extract('month', Transaction.date) == now.month,
        extract('year', Transaction.date) == now.year
    ).scalar() or 0
    monthly_expense = abs(float(monthly_expense or 0))

    # Monthly Income
    monthly_income = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.type == 'income',
        extract('month', Transaction.date) == now.month,
        extract('year', Transaction.date) == now.year
    ).scalar() or 0
    monthly_income = float(monthly_income or 0)

    # Budgets
    budgets = Budget.query.filter_by(user_id=user_id).all()
    budget_info = {b.category.name if b.category else 'Uncategorized': float(b.amount) for b in budgets}

    # Category-wise spending (from Transaction)
    category_spending = db.session.query(
        Category.name, func.sum(Transaction.amount)
    ).join(Transaction.category).filter(
        Transaction.user_id == user_id,
        Transaction.type == 'expense'
    ).group_by(Category.name).all()

    if not category_spending:
        category_spending = db.session.query(
            Category.name, func.sum(Expense.amount)
        ).join(Expense.category).filter(
            Expense.user_id == user_id
        ).group_by(Category.name).all()

    category_summary = {name: abs(float(amount)) for name, amount in category_spending}

    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "monthly_income": monthly_income,
        "monthly_expense": monthly_expense,
        "category_spending": category_summary,
        "budgets": budget_info
    }

def format_insight_prompt(data):
    category_lines = "\n".join([f"- {cat}: ₹{amt:.2f}" for cat, amt in data['category_spending'].items()])
    budget_lines = "\n".join([f"- {cat}: ₹{limit:.2f}" for cat, limit in data['budgets'].items()])

    return f"""
You are a smart personal financial advisor. Analyze this user's financial activity and give clear, actionable suggestions.

Total Income: ₹{data['total_income']:.2f}
Total Expenses: ₹{data['total_expense']:.2f}
Monthly Income: ₹{data['monthly_income']:.2f}
Monthly Expenses: ₹{data['monthly_expense']:.2f}

Spending by Category:
{category_lines or 'None recorded yet'}

Budgets Set by User:
{budget_lines or 'No active budgets'}

Please provide:
1. Spending pattern summary
2. Budget evaluation & risk observations
3. 3 personalized, high-impact tips to improve savings and reduce unnecessary spending
""".strip()

def get_financial_insights(user_id):
    groq_key = get_groq_api_key()
    data = get_user_financial_summary(user_id)

    if not groq_key:
        net_savings = data['monthly_income'] - data['monthly_expense']
        return (
            f"💡 Monthly Financial Snapshot (Offline):\n\n"
            f"- Income this month: ₹{data['monthly_income']:,.2f}\n"
            f"- Expenses this month: ₹{data['monthly_expense']:,.2f}\n"
            f"- Net Savings: ₹{net_savings:,.2f}\n\n"
            f"Connect your GROQ_API_KEY in .env to receive advanced AI-generated spending analysis."
        )

    try:
        prompt = format_insight_prompt(data)
        headers = {
            "Authorization": f"Bearer {groq_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": GROQ_MODEL_NAME,
            "messages": [
                {"role": "system", "content": "You are a helpful and encouraging financial advisor. Format output with clean, readable text and bullet points."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.6,
            "max_tokens": 1024
        }

        response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=15)
        response.raise_for_status()
        result = response.json()
        return result["choices"][0]["message"]["content"].strip()

    except requests.exceptions.RequestException as e:
        net_savings = data['monthly_income'] - data['monthly_expense']
        return (
            f"⚠️ Groq API connection issue ({str(e)}).\n\n"
            f"📊 Offline Summary:\n"
            f"- Monthly Income: ₹{data['monthly_income']:,.2f}\n"
            f"- Monthly Expenses: ₹{data['monthly_expense']:,.2f}\n"
            f"- Net Savings: ₹{net_savings:,.2f}"
        )
    except Exception as e:
        return f"Unexpected error analyzing finances: {str(e)}"
