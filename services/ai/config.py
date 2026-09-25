import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

RISK_LEVELS = {
    "low": {
        "min_score": 0.2,
        "max_score": 0.4,
        "response": "wellness_content",
        "message": "We've curated some resources that might brighten your day.",
    },
    "moderate": {
        "min_score": 0.4,
        "max_score": 0.7,
        "response": "check_in_prompt",
        "message": "We've noticed you may be going through a difficult period. Would you like to check in with your support network or explore resources?",
    },
    "high": {
        "min_score": 0.7,
        "max_score": 1.0,
        "response": "crisis_resources",
        "message": "You're not alone. If you're struggling, please reach out to someone you trust or contact emergency services.",
    },
}

SIGNAL_WEIGHTS = {
    "concerning_post_single": 0.05,
    "concerning_posts_multiple": 0.20,
    "escalating_distress": 0.30,
    "social_withdrawal": 0.20,
    "mood_decline": 0.15,
    "hopeless_language": 0.25,
    "self_harm_mention": 0.90,
    "late_night_pattern": 0.10,
}