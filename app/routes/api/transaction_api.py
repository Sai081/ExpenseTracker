from flask import Blueprint, request
from flask_login import current_user
from datetime import datetime, date
from decimal import Decimal
from sqlalchemy import or_
from app import db
from app.models import Transaction, Category
from app.routes.api import success_response, error_response, api_login_required

transaction_api_bp = Blueprint('transaction_api', __name__, url_prefix='/transactions')

def serialize_transaction(t):
    cat_name = "Uncategorized"
    try:
        if getattr(t, 'category', None) and getattr(t.category, 'name', None):
            cat_name = t.category.name
    except Exception:
        pass

    return {
        "id": t.id,
        "user_id": t.user_id,
        "type": t.type,
        "amount": float(t.amount) if t.amount is not None else 0.0,
        "category_id": t.category_id,
        "category_name": cat_name,
        "description": t.description or "",
        "date": t.date.strftime("%Y-%m-%d") if t.date else None,
        "payment_method": t.payment_method or "",
        "tags": getattr(t, 'tags', '') or "",
        "notes": getattr(t, 'notes', '') or "",
        "created_at": t.created_at.strftime("%Y-%m-%d %H:%M:%S") if getattr(t, 'created_at', None) else None
    }

@transaction_api_bp.route('', methods=['GET'])
@api_login_required
def get_transactions():
    user_id = current_user.id
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 15, type=int), 100)
    t_type = request.args.get('type')
    search = request.args.get('search')
    category_id = request.args.get('category_id', type=int)
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    sort_by = request.args.get('sort', 'date')
    order = request.args.get('order', 'desc').lower()

    query = Transaction.query.filter_by(user_id=user_id)

    if t_type and t_type.lower() in ['expense', 'income']:
        query = query.filter(Transaction.type == t_type.lower())

    if category_id:
        query = query.filter(Transaction.category_id == category_id)

    if start_date:
        try:
            s_date = datetime.strptime(start_date, "%Y-%m-%d").date()
            query = query.filter(Transaction.date >= s_date)
        except ValueError:
            pass

    if end_date:
        try:
            e_date = datetime.strptime(end_date, "%Y-%m-%d").date()
            query = query.filter(Transaction.date <= e_date)
        except ValueError:
            pass

    if search:
        search_pattern = f"%{search.strip()}%"
        search_conditions = [Transaction.description.ilike(search_pattern)]
        if hasattr(Transaction, 'notes'):
            search_conditions.append(Transaction.notes.ilike(search_pattern))
        if hasattr(Transaction, 'tags'):
            search_conditions.append(Transaction.tags.ilike(search_pattern))
        query = query.filter(or_(*search_conditions))

    # Sorting
    if sort_by == 'amount':
        query = query.order_by(Transaction.amount.asc() if order == 'asc' else Transaction.amount.desc())
    else:
        query = query.order_by(Transaction.date.asc() if order == 'asc' else Transaction.date.desc())

    query = query.order_by(Transaction.id.desc())

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)

    return success_response(data={
        "transactions": [serialize_transaction(t) for t in pagination.items],
        "total_count": pagination.total,
        "page": pagination.page,
        "per_page": pagination.per_page,
        "total_pages": pagination.pages
    })

@transaction_api_bp.route('/<int:id>', methods=['GET'])
@api_login_required
def get_transaction(id):
    txn = Transaction.query.get(id)
    if not txn or txn.user_id != current_user.id:
        return error_response("Transaction not found", status_code=404)
    return success_response(data=serialize_transaction(txn))

@transaction_api_bp.route('', methods=['POST'])
@api_login_required
def create_transaction():
    data = request.get_json() or {}
    t_type = (data.get('type') or 'expense').lower()
    amount_raw = data.get('amount')
    description = (data.get('description') or '').strip()
    date_raw = data.get('date')
    category_id = data.get('category_id')
    payment_method = data.get('payment_method')
    tags = data.get('tags')
    notes = data.get('notes')

    if amount_raw is None:
        return error_response("Amount is required", status_code=400)

    try:
        amount = Decimal(str(amount_raw))
        if amount <= 0:
            return error_response("Amount must be greater than 0", status_code=400)
    except Exception:
        return error_response("Invalid amount value", status_code=400)

    if t_type not in ['expense', 'income']:
        return error_response("Type must be either 'expense' or 'income'", status_code=400)

    # Date parse
    if date_raw:
        try:
            txn_date = datetime.strptime(date_raw, "%Y-%m-%d").date()
        except ValueError:
            return error_response("Invalid date format. Expected YYYY-MM-DD", status_code=400)
    else:
        txn_date = date.today()

    # Category validation
    if category_id:
        cat = Category.query.get(category_id)
        if not cat or (cat.user_id is not None and cat.user_id != current_user.id):
            category_id = None
    else:
        category_id = None

    txn_args = {
        'user_id': current_user.id,
        'type': t_type,
        'amount': amount,
        'category_id': category_id,
        'description': description,
        'date': txn_date,
        'payment_method': payment_method
    }
    if hasattr(Transaction, 'tags'):
        txn_args['tags'] = tags
    if hasattr(Transaction, 'notes'):
        txn_args['notes'] = notes

    new_txn = Transaction(**txn_args)

    try:
        db.session.add(new_txn)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to save transaction: {str(e)}", status_code=500)

    return success_response(
        data=serialize_transaction(new_txn),
        message="Transaction created successfully",
        status_code=201
    )

@transaction_api_bp.route('/<int:id>', methods=['PUT'])
@api_login_required
def update_transaction(id):
    txn = Transaction.query.get(id)
    if not txn or txn.user_id != current_user.id:
        return error_response("Transaction not found", status_code=404)

    data = request.get_json() or {}

    if 'amount' in data:
        try:
            amount = Decimal(str(data['amount']))
            if amount <= 0:
                return error_response("Amount must be greater than 0", status_code=400)
            txn.amount = amount
        except Exception:
            return error_response("Invalid amount value", status_code=400)

    if 'type' in data:
        t_type = str(data['type']).lower()
        if t_type in ['expense', 'income']:
            txn.type = t_type

    if 'description' in data:
        txn.description = data['description']

    if 'date' in data and data['date']:
        try:
            txn.date = datetime.strptime(data['date'], "%Y-%m-%d").date()
        except ValueError:
            return error_response("Invalid date format. Expected YYYY-MM-DD", status_code=400)

    if 'category_id' in data:
        cat_id = data['category_id']
        if cat_id:
            cat = Category.query.get(cat_id)
            if cat and (cat.user_id is None or cat.user_id == current_user.id):
                txn.category_id = cat_id
        else:
            txn.category_id = None

    if 'payment_method' in data:
        txn.payment_method = data['payment_method']
    if hasattr(Transaction, 'tags') and 'tags' in data:
        txn.tags = data['tags']
    if hasattr(Transaction, 'notes') and 'notes' in data:
        txn.notes = data['notes']

    try:
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to update transaction: {str(e)}", status_code=500)

    return success_response(
        data=serialize_transaction(txn),
        message="Transaction updated successfully"
    )

@transaction_api_bp.route('/<int:id>', methods=['DELETE'])
@api_login_required
def delete_transaction(id):
    txn = Transaction.query.get(id)
    if not txn or txn.user_id != current_user.id:
        return error_response("Transaction not found", status_code=404)

    try:
        db.session.delete(txn)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to delete transaction: {str(e)}", status_code=500)

    return success_response(message="Transaction deleted successfully")
