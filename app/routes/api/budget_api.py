from flask import Blueprint, request
from flask_login import current_user
from datetime import datetime
from decimal import Decimal
from sqlalchemy import func, extract
from app import db
from app.models import Budget, Category, Transaction
from app.routes.api import success_response, error_response, api_login_required

budget_api_bp = Blueprint('budget_api', __name__, url_prefix='/budgets')

def serialize_budget(b, spent=0.0):
    b_amt = float(b.amount)
    usage = round((spent / b_amt) * 100, 1) if b_amt > 0 else 0.0
    return {
        "id": b.id,
        "category_id": b.category_id,
        "category_name": b.category.name if b.category else "Uncategorized",
        "amount": b_amt,
        "spent": round(spent, 2),
        "remaining": round(b_amt - spent, 2),
        "usage_percent": usage,
        "month": b.month
    }

@budget_api_bp.route('', methods=['GET'])
@api_login_required
def get_budgets():
    user_id = current_user.id
    month = request.args.get('month')
    if not month:
        month = datetime.now().strftime('%Y-%m')

    try:
        dt = datetime.strptime(month, '%Y-%m')
    except ValueError:
        return error_response("Invalid month format. Expected YYYY-MM", status_code=400)

    budgets = Budget.query.filter_by(user_id=user_id, month=month).all()

    # Query expenses for this month to calculate spent per category
    txns = Transaction.query.filter_by(user_id=user_id).filter(
        Transaction.type == 'expense',
        extract('year', Transaction.date) == dt.year,
        extract('month', Transaction.date) == dt.month
    ).all()

    category_spent = {}
    for t in txns:
        if t.category_id:
            category_spent[t.category_id] = category_spent.get(t.category_id, 0.0) + abs(float(t.amount))

    total_budget = 0.0
    total_spent = 0.0
    budget_items = []

    for b in budgets:
        spent = category_spent.get(b.category_id, 0.0)
        total_budget += float(b.amount)
        total_spent += spent
        budget_items.append(serialize_budget(b, spent))

    overall_usage = round((total_spent / total_budget) * 100, 1) if total_budget > 0 else 0.0

    return success_response(data={
        "month": month,
        "total_budget": round(total_budget, 2),
        "total_spent": round(total_spent, 2),
        "overall_usage_percent": overall_usage,
        "budgets": budget_items
    })

@budget_api_bp.route('', methods=['POST'])
@api_login_required
def create_budget():
    data = request.get_json() or {}
    category_id = data.get('category_id')
    amount_raw = data.get('amount')
    month = data.get('month') or datetime.now().strftime('%Y-%m')

    if not category_id:
        return error_response("Category ID is required", status_code=400)
    if amount_raw is None:
        return error_response("Amount is required", status_code=400)

    try:
        amount = Decimal(str(amount_raw))
        if amount <= 0:
            return error_response("Amount must be greater than 0", status_code=400)
    except Exception:
        return error_response("Invalid amount value", status_code=400)

    # Check category existence
    cat = Category.query.get(category_id)
    if not cat or (cat.user_id is not None and cat.user_id != current_user.id):
        return error_response("Category not found or unauthorized", status_code=404)

    # Check duplicate
    existing = Budget.query.filter_by(
        user_id=current_user.id,
        category_id=category_id,
        month=month
    ).first()

    if existing:
        return error_response("Budget already exists for this category in this month. Update it instead.", status_code=409)

    new_budget = Budget(
        user_id=current_user.id,
        category_id=category_id,
        amount=amount,
        month=month
    )

    try:
        db.session.add(new_budget)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to create budget: {str(e)}", status_code=500)

    return success_response(
        data=serialize_budget(new_budget),
        message="Budget created successfully",
        status_code=201
    )

@budget_api_bp.route('/<int:id>', methods=['PUT'])
@api_login_required
def update_budget(id):
    budget = Budget.query.get(id)
    if not budget or budget.user_id != current_user.id:
        return error_response("Budget not found", status_code=404)

    data = request.get_json() or {}
    if 'amount' in data:
        try:
            amount = Decimal(str(data['amount']))
            if amount <= 0:
                return error_response("Amount must be greater than 0", status_code=400)
            budget.amount = amount
        except Exception:
            return error_response("Invalid amount value", status_code=400)

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to update budget: {str(e)}", status_code=500)

    return success_response(
        data=serialize_budget(budget),
        message="Budget updated successfully"
    )

@budget_api_bp.route('/<int:id>', methods=['DELETE'])
@api_login_required
def delete_budget(id):
    budget = Budget.query.get(id)
    if not budget or budget.user_id != current_user.id:
        return error_response("Budget not found", status_code=404)

    try:
        db.session.delete(budget)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to delete budget: {str(e)}", status_code=500)

    return success_response(message="Budget deleted successfully")
