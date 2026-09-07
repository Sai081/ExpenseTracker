import csv
import io
from datetime import datetime
from io import BytesIO
from flask import Blueprint, Response, make_response, request
from flask_login import current_user
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from app.models import Transaction
from app.routes.api import verify_supabase_token

export_bp = Blueprint('export', __name__)

def get_export_user():
    if current_user and current_user.is_authenticated:
        return current_user

    token = request.args.get('token')
    if not token:
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ', 1)[1].strip()

    if token:
        if token == "demo_token" or token.startswith("demo_token"):
            from app.models.user import User
            demo_user = User.query.filter_by(email="demo@expensetracker.local").first()
            if not demo_user:
                demo_user = User.query.first()
            return demo_user
        return verify_supabase_token(token)

    return None

@export_bp.route('/export/csv')
@export_bp.route('/report/export_csv')
@export_bp.route('/api/report/export_csv')
def export_csv():
    user = get_export_user()
    if not user:
        return "Authentication required to export transactions", 401
    try:
        transactions = Transaction.query.filter_by(user_id=user.id).order_by(Transaction.date.desc()).all()
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['Date', 'Type', 'Category', 'Description', 'Amount', 'Payment Method', 'Tags', 'Notes'])

        for t in transactions:
            writer.writerow([
                t.date.strftime('%Y-%m-%d') if t.date else '',
                (t.type or '').capitalize(),
                t.category.name if t.category else 'Uncategorized',
                t.description or '',
                float(t.amount) if t.amount else 0.0,
                t.payment_method or '',
                t.tags or '',
                t.notes or ''
            ])

        output.seek(0)
        return Response(
            output.getvalue(),
            mimetype='text/csv',
            headers={'Content-Disposition': f'attachment;filename=transactions_user_{user.id}.csv'}
        )
    except Exception as e:
        return f"Error generating export file: {str(e)}", 500

@export_bp.route('/export/pdf')
@export_bp.route('/api/report/export_pdf')
def export_pdf():
    user = get_export_user()
    if not user:
        return "Authentication required to export transactions", 401
    try:
        transactions = Transaction.query.filter_by(user_id=user.id).order_by(Transaction.date.desc()).all()

        buffer = BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter
        y = height - 50

        pdf.setFont("Helvetica-Bold", 14)
        pdf.drawString(30, y, "ExpenseTracker - Transaction Report")
        y -= 30

        pdf.setFont("Helvetica-Bold", 10)
        pdf.drawString(30, y, "Date")
        pdf.drawString(95, y, "Type")
        pdf.drawString(145, y, "Amount")
        pdf.drawString(210, y, "Category")
        pdf.drawString(320, y, "Description")
        y -= 20

        pdf.setFont("Helvetica", 9)
        for tx in transactions:
            if y < 50:
                pdf.showPage()
                y = height - 50
                pdf.setFont("Helvetica-Bold", 10)
                pdf.drawString(30, y, "Date")
                pdf.drawString(95, y, "Type")
                pdf.drawString(145, y, "Amount")
                pdf.drawString(210, y, "Category")
                pdf.drawString(320, y, "Description")
                y -= 20
                pdf.setFont("Helvetica", 9)

            date_str = tx.date.strftime('%Y-%m-%d') if tx.date else 'N/A'
            amount_str = f"Rs. {float(tx.amount):.2f}"
            cat_name = tx.category.name if tx.category else "Uncategorized"
            desc = (tx.description or "N/A")[:45]

            pdf.drawString(30, y, date_str)
            pdf.drawString(95, y, (tx.type or '').capitalize())
            pdf.drawString(145, y, amount_str)
            pdf.drawString(210, y, cat_name[:20])
            pdf.drawString(320, y, desc)
            y -= 18

        pdf.save()
        buffer.seek(0)

        filename = f"transactions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        response = make_response(buffer.getvalue())
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = f'attachment; filename={filename}'
        return response

    except Exception as e:
        return f"Error generating PDF export: {str(e)}", 500
