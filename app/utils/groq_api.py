import os
import re
import json
import requests
from datetime import datetime, date, timedelta
from sqlalchemy import func, extract
from app import db
from app.models import Transaction, Budget, Category, User

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_WHISPER_URL = "https://api.groq.com/openai/v1/audio/transcriptions"

# Modern active Groq chat models
DEFAULT_GROQ_MODEL = "llama-3.1-8b-instant"
ACTIVE_CHAT_MODELS = [
    "llama-3.1-8b-instant",
    "llama-3.1-70b-versatile",
    "mixtral-8x7b-32768",
    "gemma2-9b-it"
]
DEFAULT_WHISPER_MODEL = "whisper-large-v3-turbo"

def get_effective_groq_key(user_supplied_key=None):
    """Resolves Groq key: prefers user-supplied BYOK key, falls back to server .env GROQ_API_KEY."""
    if user_supplied_key and user_supplied_key.strip():
        clean_key = user_supplied_key.strip().strip('"').strip("'")
        if len(clean_key) > 5:
            return clean_key

    # Fallback to server .env key so AI features & insights ALWAYS work
    server_key = os.getenv("GROQ_API_KEY")
    if server_key and server_key.strip():
        clean_server = server_key.strip().strip('"').strip("'")
        if len(clean_server) > 5:
            return clean_server

    return None

def parse_month_year(target_month_str):
    """Parses 'YYYY-MM' into (month_int, year_int). Defaults to current month."""
    now = datetime.now()
    if not target_month_str:
        return now.month, now.year

    try:
        parts = target_month_str.strip().split('-')
        if len(parts) == 2:
            return int(parts[1]), int(parts[0])
    except Exception:
        pass
    return now.month, now.year

def get_user_financial_summary(user_id, target_month=None):
    """Returns financial summary for a target month (or current month if None)."""
    month_int, year_int = parse_month_year(target_month)
    month_str = f"{year_int:04d}-{month_int:02d}"

    # Lifetime Totals
    total_expense = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.type == 'expense'
    ).scalar() or 0
    total_income = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.type == 'income'
    ).scalar() or 0

    # Monthly for target month
    monthly_expense = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.type == 'expense',
        extract('month', Transaction.date) == month_int,
        extract('year', Transaction.date) == year_int
    ).scalar() or 0

    monthly_income = db.session.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user_id,
        Transaction.type == 'income',
        extract('month', Transaction.date) == month_int,
        extract('year', Transaction.date) == year_int
    ).scalar() or 0

    # Budgets for target month
    budgets = Budget.query.filter_by(user_id=user_id, month=month_str).all()
    budget_info = {b.category.name if b.category else 'Uncategorized': float(b.amount) for b in budgets}

    # Category-wise spending for target month
    category_spending = db.session.query(
        Category.name, func.sum(Transaction.amount)
    ).join(Transaction.category).filter(
        Transaction.user_id == user_id,
        Transaction.type == 'expense',
        extract('month', Transaction.date) == month_int,
        extract('year', Transaction.date) == year_int
    ).group_by(Category.name).all()

    category_summary = {name: abs(float(amount)) for name, amount in category_spending}

    # Recent transactions
    recent_txns = Transaction.query.filter_by(user_id=user_id).order_by(Transaction.date.desc()).limit(10).all()
    recent_list = []
    for t in recent_txns:
        recent_list.append({
            "id": t.id,
            "type": t.type,
            "amount": float(t.amount) if t.amount else 0.0,
            "category": t.category.name if t.category else "Uncategorized",
            "description": t.description or "",
            "date": t.date.strftime("%Y-%m-%d") if t.date else "",
            "payment_method": t.payment_method or ""
        })

    return {
        "month": month_str,
        "month_name": datetime(year_int, month_int, 1).strftime("%B %Y"),
        "total_income": float(total_income),
        "total_expense": abs(float(total_expense)),
        "monthly_income": float(monthly_income),
        "monthly_expense": abs(float(monthly_expense)),
        "net_savings": float(monthly_income) - abs(float(monthly_expense)),
        "category_spending": category_summary,
        "budgets": budget_info,
        "recent_transactions": recent_list
    }

def get_yearly_financial_trend(user_id, num_months=12):
    """Calculates month-by-month income, expense, and savings for the past 12 months."""
    today = date.today()
    trend = []

    month_slots = []
    year = today.year
    month = today.month

    for _ in range(num_months):
        month_slots.append((year, month))
        month -= 1
        if month == 0:
            month = 12
            year -= 1

    month_slots.reverse()

    for y, m in month_slots:
        m_str = f"{y:04d}-{m:02d}"
        label = datetime(y, m, 1).strftime("%b %y")

        inc = db.session.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.type == 'income',
            extract('month', Transaction.date) == m,
            extract('year', Transaction.date) == y
        ).scalar() or 0.0

        exp = db.session.query(func.sum(Transaction.amount)).filter(
            Transaction.user_id == user_id,
            Transaction.type == 'expense',
            extract('month', Transaction.date) == m,
            extract('year', Transaction.date) == y
        ).scalar() or 0.0

        inc = float(inc)
        exp = abs(float(exp))
        sav = inc - exp
        rate = round((sav / inc * 100), 1) if inc > 0 else 0.0

        trend.append({
            "month": m_str,
            "label": label,
            "income": round(inc, 2),
            "expense": round(exp, 2),
            "savings": round(sav, 2),
            "savings_rate": rate
        })

    return trend

def local_parse_transaction(text, categories):
    """Fallback NLP heuristics when Groq API is unavailable."""
    today_str = date.today().strftime("%Y-%m-%d")
    text_lower = text.lower()

    # 1. Amount extraction
    amount = 0.0
    amount_match = re.search(r'(?:₹|\$|€|£|rs\.?|inr|rupees?|dollars?|euros?)?\s*(\d+(?:,\d+)*(?:\.\d{1,2})?)\s*(?:₹|\$|€|£|rs\.?|inr|rupees?|dollars?|euros?)?', text_lower)
    if amount_match:
        raw_val = amount_match.group(1).replace(',', '')
        try:
            amount = float(raw_val)
        except ValueError:
            amount = 100.0

    # 2. Type extraction
    is_income = any(w in text_lower for w in ['salary', 'received', 'credited', 'earned', 'deposit', 'dividend', 'bonus', 'refund', 'freelance'])
    txn_type = 'income' if is_income else 'expense'

    # 3. Payment method
    if any(w in text_lower for w in ['upi', 'gpay', 'phonepe', 'paytm', 'bhim']):
        payment_method = 'upi'
    elif any(w in text_lower for w in ['card', 'credit', 'debit', 'visa', 'mastercard']):
        payment_method = 'card'
    elif any(w in text_lower for w in ['cash', 'notes', 'atm']):
        payment_method = 'cash'
    elif any(w in text_lower for w in ['bank', 'transfer', 'neft', 'rtgs', 'imps']):
        payment_method = 'bank_transfer'
    else:
        payment_method = 'upi'

    # 4. Category matching
    matched_cat = 'Miscellaneous' if txn_type == 'expense' else 'Salary'
    cat_keywords = {
        'Food & Dining': ['lunch', 'dinner', 'breakfast', 'food', 'restaurant', 'cafe', 'biryani', 'pizza', 'burger', 'swiggy', 'zomato', 'eat', 'coffee', 'tea', 'snacks'],
        'Groceries': ['grocery', 'groceries', 'supermarket', 'blinkit', 'zepto', 'instamart', 'milk', 'vegetables', 'fruits', 'market'],
        'Transportation': ['fuel', 'petrol', 'diesel', 'uber', 'ola', 'auto', 'metro', 'bus', 'flight', 'train', 'ticket', 'taxi'],
        'Housing & Rent': ['rent', 'maintenance', 'flat', 'apartment', 'house'],
        'Utilities & Bills': ['bill', 'electricity', 'water', 'gas', 'internet', 'wifi', 'recharge', 'mobile', 'broadband'],
        'Entertainment & Leisure': ['movie', 'cinema', 'netflix', 'prime', 'spotify', 'hotstar', 'game', 'concert', 'party'],
        'Healthcare & Fitness': ['medicine', 'doctor', 'hospital', 'pharmacy', 'gym', 'health', 'fitness', 'clinic'],
        'Shopping': ['shopping', 'clothes', 'amazon', 'flipkart', 'shoes', 'mall', 'electronics'],
        'Salary': ['salary', 'payroll', 'consulting', 'freelance', 'stipend', 'client payment']
    }

    found = False
    for cat_name, keywords in cat_keywords.items():
        if any(k in text_lower for k in keywords):
            matched_cat = cat_name
            found = True
            break

    if not found and categories:
        for c in categories:
            if c['name'].lower() in text_lower:
                matched_cat = c['name']
                break

    clean_desc = text.strip()
    if len(clean_desc) > 80:
        clean_desc = clean_desc[:77] + "..."

    return {
        "amount": amount,
        "type": txn_type,
        "category": matched_cat,
        "description": clean_desc or f"{matched_cat} transaction",
        "payment_method": payment_method,
        "date": today_str
    }

def parse_voice_transaction(text, categories, api_key=None):
    effective_key = get_effective_groq_key(api_key)
    cat_names = [c["name"] for c in categories]
    today_str = date.today().strftime("%Y-%m-%d")

    if effective_key:
        system_prompt = f"""
You are an expert natural language financial transaction parser for ExpenseTracker AI.
Today's date is: {today_str}.
Available user categories are: {json.dumps(cat_names)}.

Analyze the spoken transcript from the user and extract structured transaction details.
You MUST output ONLY valid, strictly parseable JSON with the following schema:
{{
  "amount": <number>,
  "type": "expense" or "income",
  "category": "<best matching category from list or 'Uncategorized'>",
  "description": "<concise description>",
  "payment_method": "<cash, card, upi, bank_transfer, or other>",
  "date": "<YYYY-MM-DD>"
}}
Do not include markdown code blocks or explanations, ONLY the raw JSON object.
""".strip()

        headers = {
            "Authorization": f"Bearer {effective_key}",
            "Content-Type": "application/json"
        }

        for model_name in ACTIVE_CHAT_MODELS:
            payload = {
                "model": model_name,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": text}
                ],
                "temperature": 0.1,
                "max_tokens": 300,
                "response_format": {"type": "json_object"}
            }

            try:
                response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=15)
                if response.status_code == 200:
                    res_json = response.json()
                    content = res_json["choices"][0]["message"]["content"]
                    return json.loads(content)
            except Exception:
                continue

    # Graceful fallback to local parser
    return local_parse_transaction(text, categories)

def transcribe_audio_file(audio_bytes, filename="audio.webm", api_key=None):
    """Transcribes audio data using Groq's Whisper API endpoint."""
    effective_key = get_effective_groq_key(api_key)
    if not effective_key:
        raise ValueError("Groq API key is required for voice audio transcription.")

    headers = {"Authorization": f"Bearer {effective_key}"}
    files = {"file": (filename, audio_bytes, "audio/webm")}
    data = {
        "model": DEFAULT_WHISPER_MODEL,
        "temperature": "0.0",
        "response_format": "json",
        "language": "en"
    }

    try:
        response = requests.post(GROQ_WHISPER_URL, headers=headers, files=files, data=data, timeout=30)
        if response.status_code == 200:
            return response.json().get("text", "").strip()
        else:
            err_data = response.json() if response.text else {}
            err_msg = err_data.get('error', {}).get('message') or response.text
            raise RuntimeError(f"Groq Whisper transcription failed: {err_msg}")
    except Exception as e:
        raise RuntimeError(f"Audio transcription error: {str(e)}")

def is_transaction_command(message):
    """Detects if a user message in chat is an action command to record an expense or income."""
    msg = message.lower().strip()
    
    if any(msg.startswith(q) for q in ['how much', 'what is', 'what did', 'can i afford', 'show me', 'list all', 'tell me', 'where did', 'am i over', 'why']):
        return False
    if '?' in msg:
        return False

    action_keywords = [
        'spent', 'paid', 'bought', 'add expense', 'add transaction', 'record expense',
        'record income', 'got salary', 'received salary', 'add income', 'put 500', 'put 300'
    ]
    if any(k in msg for k in action_keywords):
        return True

    has_number = bool(re.search(r'\d+', msg))
    has_spending_word = any(w in msg for w in ['rupees', 'rs', 'inr', 'dollar', 'lunch', 'dinner', 'uber', 'food', 'groceries', 'coffee', 'swiggy', 'blinkit', 'upi'])
    if has_number and has_spending_word:
        return True

    return False

def execute_chat_transaction(user_id, message, api_key=None):
    """Extracts and creates a transaction directly from chat message."""
    categories = Category.query.filter(
        (Category.user_id == user_id) | (Category.user_id.is_(None))
    ).all()
    cat_list = [{"id": c.id, "name": c.name} for c in categories]

    parsed = parse_voice_transaction(message, cat_list, api_key=api_key)
    amount = float(parsed.get('amount', 0.0))
    if amount <= 0:
        return None

    matched_id = None
    parsed_cat = (parsed.get('category') or '').lower().strip()
    for c in cat_list:
        if c['name'].lower() == parsed_cat:
            matched_id = c['id']
            break

    if not matched_id and categories:
        matched_id = categories[0].id

    txn_date_str = parsed.get('date') or date.today().strftime('%Y-%m-%d')
    try:
        txn_date = datetime.strptime(txn_date_str, '%Y-%m-%d').date()
    except Exception:
        txn_date = date.today()

    new_txn = Transaction(
        user_id=user_id,
        type=parsed.get('type', 'expense'),
        amount=amount,
        category_id=matched_id,
        description=parsed.get('description', message[:60]),
        date=txn_date,
        payment_method=parsed.get('payment_method', 'upi')
    )

    db.session.add(new_txn)
    db.session.commit()

    cat_name = parsed.get('category') or 'Uncategorized'
    method = parsed.get('payment_method', 'upi').upper()
    action_type = "Expense" if new_txn.type == 'expense' else "Income"

    return {
        "reply": f"✅ **{action_type} Recorded Successfully!**\n\n- **Amount**: ₹{amount:,.2f}\n- **Category**: {cat_name}\n- **Method**: {method}\n- **Date**: {txn_date.strftime('%Y-%m-%d')}\n- **Description**: {new_txn.description}\n\nYour dashboard and transaction ledger have been updated.",
        "transaction_created": True,
        "transaction": {
            "id": new_txn.id,
            "amount": amount,
            "type": new_txn.type,
            "category": cat_name,
            "date": txn_date.strftime('%Y-%m-%d')
        }
    }

def financial_chat_reply(user_id, message, conversation_history, api_key=None):
    effective_key = get_effective_groq_key(api_key)

    # 1. Check if user is asking to record an expense/income
    if is_transaction_command(message):
        res = execute_chat_transaction(user_id, message, api_key=effective_key)
        if res:
            return res

    summary = get_user_financial_summary(user_id)
    today_str = date.today().strftime("%Y-%m-%d")

    system_prompt = f"""
You are "ExpenseTracker AI", a friendly, highly skilled personal wealth advisor embedded in the user's Expense Tracker.
Today's date is {today_str}. Always format financial figures using Indian Rupee (₹).

User's Real-Time Financial Profile for {summary.get('month_name', 'current month')}:
- Monthly Income: ₹{summary['monthly_income']:.2f}
- Monthly Expenses: ₹{summary['monthly_expense']:.2f}
- Net Savings: ₹{summary['net_savings']:.2f}
- Category Budgets: {json.dumps(summary['budgets'])}
- Spending by Category this Month: {json.dumps(summary['category_spending'])}
- Recent Transactions: {json.dumps(summary['recent_transactions'][:5])}

Instructions:
1. Answer the user's financial questions with reference to their actual numbers above.
2. Be encouraging, concise, actionable, and formatted with clean Markdown bullet points.
3. If they ask about affordability or budgets, provide exact remaining amounts.
""".strip()

    if effective_key:
        messages = [{"role": "system", "content": system_prompt}]
        for msg in conversation_history[-8:]:
            c = (msg.get("content") or "").strip()
            r = msg.get("role")
            if c and r in ["user", "assistant"]:
                messages.append({"role": r, "content": c})
        messages.append({"role": "user", "content": message.strip()})

        headers = {
            "Authorization": f"Bearer {effective_key}",
            "Content-Type": "application/json"
        }

        for model_name in ACTIVE_CHAT_MODELS:
            payload = {
                "model": model_name,
                "messages": messages,
                "temperature": 0.6,
                "max_tokens": 800
            }

            try:
                response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=20)
                if response.status_code == 200:
                    res_json = response.json()
                    return {"reply": res_json["choices"][0]["message"]["content"].strip()}
            except Exception:
                continue

    # Friendly contextual fallback using real database numbers
    m_inc = summary.get('monthly_income', 0.0)
    m_exp = summary.get('monthly_expense', 0.0)
    m_sav = m_inc - m_exp
    return {
        "reply": f"👋 **ExpenseTracker AI Summary**:\n\n- **Income this month**: ₹{m_inc:,.2f}\n- **Expenses this month**: ₹{m_exp:,.2f}\n- **Net Savings**: ₹{m_sav:,.2f}\n\n*Tip: Ask me about your budgets or speak 'Spent 350 for lunch via UPI' to log an expense!*"
    }

def get_financial_insights(user_id, api_key=None, target_month=None):
    """Generates structured financial insights with health score, breakdown, yearly trends, and AI recommendations."""
    summary = get_user_financial_summary(user_id, target_month=target_month)
    monthly_inc = summary.get('monthly_income', 0.0)
    monthly_exp = summary.get('monthly_expense', 0.0)
    net_savings = monthly_inc - monthly_exp
    cat_spending = summary.get('category_spending', {})
    budgets = summary.get('budgets', {})

    # Calculate financial health score (0 to 100)
    score = 65
    savings_rate = (net_savings / monthly_inc * 100) if monthly_inc > 0 else 0

    if savings_rate >= 30:
        score += 25
    elif savings_rate >= 20:
        score += 15
    elif savings_rate >= 10:
        score += 5
    elif savings_rate < 0:
        score -= 20

    over_budget_count = 0
    budget_evals = []
    for cat, limit in budgets.items():
        spent = cat_spending.get(cat, 0.0)
        pct = (spent / limit * 100) if limit > 0 else 0
        status = 'on_track' if pct < 80 else ('warning' if pct <= 100 else 'exceeded')
        if status == 'exceeded':
            over_budget_count += 1
        budget_evals.append({
            "category": cat,
            "spent": spent,
            "limit": limit,
            "percentage": round(pct, 1),
            "status": status
        })

    score -= (over_budget_count * 10)
    score = max(20, min(98, score))
    score_rating = "Excellent" if score >= 85 else ("Good" if score >= 70 else ("Fair" if score >= 50 else "Needs Attention"))

    actionable_tips = []
    if savings_rate >= 20:
        actionable_tips.append({
            "title": "Maintain High Savings Trajectory",
            "badge": "Growth",
            "category": "Wealth Building",
            "text": f"You are saving {savings_rate:.1f}% of your monthly income (₹{net_savings:,.2f}). Allocate this into index funds, emergency reserves, or high-yield deposits.",
            "impact": "+₹15,000 / yr"
        })
    else:
        actionable_tips.append({
            "title": "Boost Savings Toward the 20% Benchmark",
            "badge": "Optimization",
            "category": "Savings Target",
            "text": f"Your current savings rate is {savings_rate:.1f}%. Trimming discretionary expenses by 10% will help you build a robust 6-month safety buffer.",
            "impact": "+₹3,500 / mo"
        })

    if cat_spending:
        highest_cat, highest_amt = sorted(cat_spending.items(), key=lambda x: x[1], reverse=True)[0]
        cat_pct = (highest_amt / monthly_exp * 100) if monthly_exp > 0 else 0
        actionable_tips.append({
            "title": f"Review {highest_cat} Outflow",
            "badge": "Top Outflow",
            "category": highest_cat,
            "text": f"{highest_cat} represents {cat_pct:.1f}% of your total spending (₹{highest_amt:,.2f}). Look for recurring subscriptions or bulk savings opportunities.",
            "impact": f"Save ~₹{(highest_amt * 0.15):,.0f}"
        })

    actionable_tips.append({
        "title": "50 / 30 / 20 Budgeting Rule",
        "badge": "Guideline",
        "category": "Discipline",
        "text": "Target allocating 50% of income to essential Needs (Rent, Bills, Groceries), 30% to Wants (Dining, Leisure), and 20% directly to Savings & Investments.",
        "impact": "Balanced Lifestyle"
    })

    # Yearly 12-month historical trend
    yearly_trend = get_yearly_financial_trend(user_id)

    # Narrative from Groq LLM
    ai_narrative = ""
    effective_key = get_effective_groq_key(api_key)
    if effective_key:
        prompt = f"""
You are a senior personal wealth advisor analyzing this user's finances for {summary.get('month_name', 'the month')}:
- Total Income: ₹{monthly_inc:,.2f}
- Total Expenses: ₹{monthly_exp:,.2f}
- Net Savings: ₹{net_savings:,.2f} ({savings_rate:.1f}%)
- Category Spending: {json.dumps(cat_spending)}
- Category Budgets: {json.dumps(budgets)}

Provide a sharp, encouraging, and deeply practical financial analysis in 3 clear markdown sections:
### 1. Financial Snapshot & Cash Flow
### 2. Budget Health & Risk Observations
### 3. High-Impact Action Items for This Month
Keep tone professional, encouraging, and formatted with clean bullet points. Format with Indian Rupee (₹).
""".strip()

        headers = {
            "Authorization": f"Bearer {effective_key}",
            "Content-Type": "application/json"
        }

        for model_name in ACTIVE_CHAT_MODELS:
            payload = {
                "model": model_name,
                "messages": [
                    {"role": "system", "content": "You are a senior personal finance expert. Format cleanly with markdown."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.6,
                "max_tokens": 1024
            }
            try:
                res = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=20)
                if res.status_code == 200:
                    ai_narrative = res.json()["choices"][0]["message"]["content"].strip()
                    break
            except Exception:
                continue

    # Fallback personalized narrative based on real numbers (so user NEVER sees a lock error)
    if not ai_narrative:
        month_display = summary.get('month_name', 'This Month')
        top_cat_name = sorted(cat_spending.items(), key=lambda x: x[1], reverse=True)[0][0] if cat_spending else 'General Expenses'
        top_cat_val = cat_spending.get(top_cat_name, 0.0)

        ai_narrative = f"""### 1. Financial Snapshot & Cash Flow ({month_display})
- **Monthly Income**: ₹{monthly_inc:,.2f}
- **Monthly Expenses**: ₹{monthly_exp:,.2f}
- **Net Wealth Retained**: **+₹{net_savings:,.2f}** ({savings_rate:.1f}% savings rate)
Your net monthly cash flow is positive and healthy for this period.

### 2. Budget Health & Risk Observations
{'- All active category budgets performed within target spending boundaries.' if over_budget_count == 0 else f'- ⚠️ Over budget on {over_budget_count} categories. Review discretionary transactions.'}
- Primary spending focus: **{top_cat_name}** (₹{top_cat_val:,.2f}).
- Overall Financial Health Score: **{score}/100 ({score_rating})**.

### 3. High-Impact Action Items
- Continue logging daily transactions with the **Voice Quick Entry** tool to maintain ledger velocity.
- Allocate surplus monthly savings directly into high-yield deposits or emergency reserves.
- Target allocating 50% of income to essential Needs, 30% to Wants, and 20% directly to Savings."""

    return {
        "selected_month": summary.get('month'),
        "selected_month_name": summary.get('month_name'),
        "health_score": score,
        "score_rating": score_rating,
        "savings_rate": round(savings_rate, 1),
        "monthly_income": monthly_inc,
        "monthly_expenses": monthly_exp,
        "net_savings": net_savings,
        "budgets_analyzed": budget_evals,
        "actionable_tips": actionable_tips,
        "yearly_trend": yearly_trend,
        "insights_text": ai_narrative
    }
