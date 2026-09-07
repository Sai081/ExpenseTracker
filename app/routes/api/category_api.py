from flask import Blueprint, request
from flask_login import current_user
from sqlalchemy import or_
from app import db
from app.models import Category
from app.routes.api import success_response, error_response, api_login_required

category_api_bp = Blueprint('category_api', __name__, url_prefix='/categories')

def serialize_category(c):
    return {
        "id": c.id,
        "name": c.name,
        "type": getattr(c, 'type', 'expense'),
        "is_custom": c.user_id is not None
    }

@category_api_bp.route('', methods=['GET'])
@api_login_required
def get_categories():
    user_id = current_user.id
    c_type = request.args.get('type')

    query = Category.query.filter(
        or_(Category.user_id == user_id, Category.user_id.is_(None))
    )

    if c_type:
        query = query.filter(Category.type == c_type.lower())

    categories = query.order_by(Category.name.asc()).all()

    return success_response(data=[serialize_category(c) for c in categories])

@category_api_bp.route('', methods=['POST'])
@api_login_required
def create_category():
    data = request.get_json() or {}
    name = (data.get('name') or '').strip()
    c_type = (data.get('type') or 'expense').lower()

    if not name:
        return error_response("Category name is required", status_code=400)

    # Check if category already exists for this user or as default
    existing = Category.query.filter(
        (Category.name.ilike(name)) &
        (or_(Category.user_id == current_user.id, Category.user_id.is_(None)))
    ).first()

    if existing:
        return error_response("A category with this name already exists", status_code=409)

    new_cat = Category(
        name=name,
        type=c_type,
        user_id=current_user.id
    )

    try:
        db.session.add(new_cat)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to create category: {str(e)}", status_code=500)

    return success_response(
        data=serialize_category(new_cat),
        message="Category created successfully",
        status_code=201
    )

@category_api_bp.route('/<int:id>', methods=['DELETE'])
@api_login_required
def delete_category(id):
    cat = Category.query.get(id)
    if not cat:
        return error_response("Category not found", status_code=404)

    if cat.user_id is None:
        return error_response("System default categories cannot be deleted", status_code=403)

    if cat.user_id != current_user.id:
        return error_response("Unauthorized", status_code=403)

    try:
        db.session.delete(cat)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to delete category: {str(e)}", status_code=500)

    return success_response(message="Category deleted successfully")
