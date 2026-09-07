from flask import Blueprint, request
from flask_login import current_user
from datetime import datetime, date
from sqlalchemy import func, extract
from app import db
from app.models import Transaction, Budget, Category, Income
from app.routes.api import success_response, error_response, api_login_required

dashboard_api_bp = Blueprint('dashboard_api', __name__, url_prefix='/dashboard')

@dashboard_api_bp.route('/summary', methods=['GET'])
@api_login_required
def get_dashboard_summary():
    user_id = current_user.id
    today = date.today()

    target_month_param = request.args.get('month')  # e.g. '2026-08'
    if target_month_param:
        try:
            parts = target_month_param.split('-')
            year_int = int(parts[0])
            month_int = int(parts[1])
        except Exception:
            year_int, month_int = today.year, today.month
    else:
        year_int, month_int = today.year, today.month

    target_month_str = f"{year_int:04d}-{month_int:02d}"
    month_name = datetime(year_int, month_int, 1).strftime("%B %Y")
    is_current_month = (month_int == today.month and year_int == today.year)

    # Monthly Income: sum from Transaction or Income model for target month
    monthly_income = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.type == 'income',
        extract('month', Transaction.date) == month_int,
        extract('year', Transaction.date) == year_int
    ).scalar()
    if monthly_income is None:
        monthly_income = db.session.query(func.sum(Income.amount)).filter(
            Income.user_id == user_id,
            extract('month', Income.date) == month_int,
            extract('year', Income.date) == year_int
        ).scalar() or 0
    monthly_income = float(monthly_income or 0)

    # Monthly Expenses for target month
    monthly_expenses = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.type == 'expense',
        extract('month', Transaction.date) == month_int,
        extract('year', Transaction.date) == year_int
    ).scalar() or 0
    monthly_expenses = abs(float(monthly_expenses))

    # Today's Expenses (only if viewing current month/year, else 0.0)
    if is_current_month:
        today_expenses = db.session.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.type == 'expense',
            Transaction.date == today
        ).scalar() or 0
        today_expenses = abs(float(today_expenses))

        today_count = db.session.query(func.count(Transaction.id)).filter(
            Transaction.user_id == user_id,
            Transaction.type == 'expense',
            Transaction.date == today
        ).scalar() or 0
    else:
        today_expenses = 0.0
        today_count = 0

    # Budget Calculation for target month
    budgets = Budget.query.filter_by(user_id=user_id, month=target_month_str).all()
    month_txns = Transaction.query.filter_by(user_id=user_id).filter(
        extract('month', Transaction.date) == month_int,
        extract('year', Transaction.date) == year_int
    ).all()

    category_spent = {}
    for txn in month_txns:
        if txn.type == 'expense' and txn.category_id:
            category_spent[txn.category_id] = category_spent.get(txn.category_id, 0.0) + abs(float(txn.amount))

    budget_list = []
    total_budget = 0.0
    total_spent = 0.0

    for b in budgets:
        b_amount = float(b.amount)
        spent = category_spent.get(b.category_id, 0.0)
        usage_pct = round((spent / b_amount) * 100, 1) if b_amount > 0 else 0.0
        total_budget += b_amount
        total_spent += spent
        budget_list.append({
            "id": b.id,
            "category_id": b.category_id,
            "category_name": b.category.name if b.category else "Uncategorized",
            "amount": b_amount,
            "spent": round(spent, 2),
            "remaining": round(b_amount - spent, 2),
            "usage_percent": usage_pct
        })

    total_budget_usage = round((total_spent / total_budget) * 100, 1) if total_budget > 0 else 0.0

    # Category Breakdown for Pie Chart for target month
    expense_query = db.session.query(
        Category.name,
        func.sum(Transaction.amount)
    ).join(Transaction.category).filter(
        Transaction.user_id == user_id,
        Transaction.type == 'expense',
        extract('month', Transaction.date) == month_int,
        extract('year', Transaction.date) == year_int
    ).group_by(Category.name).all()

    category_breakdown = [
        {"category": label, "amount": abs(float(val))}
        for label, val in expense_query
    ]

    # Recent Transactions for target month
    recent_txns = Transaction.query.filter_by(user_id=user_id).filter(
        extract('month', Transaction.date) == month_int,
        extract('year', Transaction.date) == year_int
    ).order_by(
        Transaction.date.desc(), Transaction.id.desc()
    ).limit(5).all()

    if not recent_txns:
        # Fallback to last 5 transactions overall if none in this month
        recent_txns = Transaction.query.filter_by(user_id=user_id).order_by(
            Transaction.date.desc(), Transaction.id.desc()
        ).limit(5).all()

    recent_list = [{
        "id": t.id,
        "type": t.type,
        "amount": float(t.amount),
        "category": t.category.name if t.category else "Uncategorized",
        "category_id": t.category_id,
        "description": t.description or "",
        "date": t.date.strftime("%Y-%m-%d") if t.date else "",
        "payment_method": t.payment_method or ""
    } for t in recent_txns]

    return success_response(data={
        "selected_month": target_month_str,
        "selected_month_name": month_name,
        "is_current_month": is_current_month,
        "summary": {
            "monthly_income": monthly_income,
            "monthly_expenses": monthly_expenses,
            "net_savings": round(monthly_income - monthly_expenses, 2),
            "today_expenses": today_expenses,
            "today_count": today_count,
            "total_budget": round(total_budget, 2),
            "total_spent": round(total_spent, 2),
            "budget_usage_percent": total_budget_usage
        },
        "budgets": budget_list,
        "category_breakdown": category_breakdown,
        "recent_transactions": recent_list
    })
