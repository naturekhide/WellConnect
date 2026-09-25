from transformers import pipeline

emotion_analyzer = pipeline(
    "text-classification",
    model="bhadresh-savani/distilbert-base-uncased-emotion",
    top_k=None,
    max_length=512,
    truncation=True,
)


def analyze_emotion(text: str) -> dict:
    if not text or len(text.strip()) < 3:
        return {"dominant": "neutral", "scores": {}}

    results = emotion_analyzer(text[:500])[0]

    scores = {}
    for item in results:
        scores[item["label"]] = round(item["score"], 4)

    dominant = max(scores, key=scores.get) if scores else "neutral"

    return {"dominant": dominant, "scores": scores}