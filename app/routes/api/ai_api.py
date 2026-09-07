from flask import Blueprint, request
from flask_login import current_user
from sqlalchemy import or_
from app.models import Category
from app.utils.groq_api import (
    get_financial_insights,
    get_user_financial_summary,
    get_yearly_financial_trend,
    parse_voice_transaction,
    financial_chat_reply,
    transcribe_audio_file
)
from app.routes.api import success_response, error_response, api_login_required
import base64

ai_api_bp = Blueprint('ai_api', __name__, url_prefix='/ai')

def get_request_api_key():
    key = request.headers.get("X-Groq-Api-Key")
    if key and key.strip():
        return key.strip()
    return None

@ai_api_bp.route('/insights', methods=['GET'])
@api_login_required
def get_insights():
    api_key = get_request_api_key()
    target_month = request.args.get('month')  # e.g. '2026-08' or None
    try:
        insights_data = get_financial_insights(current_user.id, api_key=api_key, target_month=target_month)
        return success_response(data=insights_data)
    except Exception as e:
        return error_response(f"Error fetching insights: {str(e)}", status_code=500)

@ai_api_bp.route('/insights/yearly', methods=['GET'])
@api_login_required
def get_yearly_insights():
    try:
        trend = get_yearly_financial_trend(current_user.id)
        return success_response(data={"yearly_trend": trend})
    except Exception as e:
        return error_response(f"Error fetching yearly trend: {str(e)}", status_code=500)

@ai_api_bp.route('/insights/generate', methods=['POST'])
@api_login_required
def generate_insights():
    api_key = get_request_api_key()
    if not api_key:
        return error_response("Groq API key is required to generate AI insights. Please connect your personal key.", status_code=403, errors={"key_required": True})

    data = request.get_json() or {}
    target_month = data.get('month')
    try:
        insights_data = get_financial_insights(current_user.id, api_key=api_key, target_month=target_month)
        return success_response(
            data={"insights": insights_data},
            message="Insights generated successfully"
        )
    except Exception as e:
        return error_response(f"Failed to generate insights: {str(e)}", status_code=500)

@ai_api_bp.route('/voice-parse', methods=['POST'])
@api_login_required
def voice_parse():
    api_key = get_request_api_key()
    if not api_key:
        return error_response("Groq API key is required for Voice Parsing. Please connect your personal key.", status_code=403, errors={"key_required": True})

    data = request.get_json() or {}
    transcript = (data.get('text') or '').strip()
    if not transcript:
        return error_response("Transcript text is required", status_code=400)

    categories = Category.query.filter(
        or_(Category.user_id == current_user.id, Category.user_id.is_(None))
    ).all()
    cat_list = [{"id": c.id, "name": c.name} for c in categories]

    try:
        parsed_txn = parse_voice_transaction(transcript, cat_list, api_key=api_key)

        matched_cat_id = None
        parsed_cat_name = (parsed_txn.get("category") or "").strip().lower()
        for cat in cat_list:
            if cat["name"].lower() == parsed_cat_name:
                matched_cat_id = cat["id"]
                break
        parsed_txn["category_id"] = matched_cat_id

        return success_response(
            data=parsed_txn,
            message="Voice transcript parsed successfully"
        )
    except ValueError as ve:
        return error_response(str(ve), status_code=400)
    except Exception as e:
        return error_response(f"Voice parsing error: {str(e)}", status_code=500)

@ai_api_bp.route('/transcribe', methods=['POST'])
@api_login_required
def transcribe_audio():
    api_key = get_request_api_key()
    if not api_key:
        return error_response("Groq API key is required for Whisper Audio Transcription.", status_code=403, errors={"key_required": True})

    audio_bytes = None
    filename = "voice_recording.webm"

    if 'file' in request.files:
        uploaded_file = request.files['file']
        audio_bytes = uploaded_file.read()
        filename = uploaded_file.filename or filename
    elif request.is_json:
        data = request.get_json()
        b64_data = data.get('audio')
        if b64_data:
            if ',' in b64_data:
                b64_data = b64_data.split(',', 1)[1]
            audio_bytes = base64.b64decode(b64_data)

    if not audio_bytes:
        return error_response("No audio file or base64 stream provided", status_code=400)

    try:
        transcript = transcribe_audio_file(audio_bytes, filename=filename, api_key=api_key)
        return success_response(
            data={"text": transcript},
            message="Voice audio transcribed successfully"
        )
    except Exception as e:
        return error_response(str(e), status_code=500)

@ai_api_bp.route('/chat', methods=['POST'])
@api_login_required
def chat():
    api_key = get_request_api_key()
    if not api_key:
        return error_response(
            "Groq API Key is required to chat with ExpenseTracker AI. Please connect your personal key.",
            status_code=403,
            errors={"key_required": True}
        )

    data = request.get_json() or {}
    message = (data.get('message') or '').strip()
    history = data.get('history') or []

    if not message:
        return error_response("Message cannot be empty", status_code=400)

    try:
        res = financial_chat_reply(current_user.id, message, history, api_key=api_key)
        return success_response(data=res)
    except Exception as e:
        return error_response(f"Chat error: {str(e)}", status_code=500)
