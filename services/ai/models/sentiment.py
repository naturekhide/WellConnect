from transformers import pipeline

sentiment_analyzer = pipeline(
    "text-classification",
    model="SamLowe/roberta-base-go_emotions",
    top_k=None,
    max_length=512,
    truncation=True,
)

POSITIVE = ["joy", "love", "gratitude", "approval", "admiration", "optimism", "relief", "pride", "excitement", "amusement", "caring"]
LOW = ["sadness", "grief", "fear", "anger", "disappointment", "disapproval", "nervousness", "remorse", "embarrassment", "confusion", "annoyance", "disgust"]


def analyze_sentiment(text: str) -> dict:
    if not text or len(text.strip()) < 3:
        return {"sentiment": "neutral", "label": "neutral", "confidence": 0.5}

    results = sentiment_analyzer(text[:500])[0]

    positive_score = 0.0
    low_score = 0.0

    for item in results:
        if item["label"] in POSITIVE:
            positive_score += item["score"]
        elif item["label"] in LOW:
            low_score += item["score"]

    if low_score > positive_score:
        return {"sentiment": "low", "label": "struggling", "confidence": round(min(low_score, 1.0), 4)}
    elif positive_score > low_score:
        return {"sentiment": "positive", "label": "thriving", "confidence": round(min(positive_score, 1.0), 4)}
    else:
        return {"sentiment": "neutral", "label": "neutral", "confidence": 0.5}