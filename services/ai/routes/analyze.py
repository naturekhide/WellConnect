from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional, List
from models.sentiment import analyze_sentiment
from models.emotion import analyze_emotion

router = APIRouter(prefix="/analyze", tags=["analyze"])


class TextRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    user_id: Optional[str] = None


@router.post("/sentiment")
def sentiment_endpoint(request: TextRequest):
    result = analyze_sentiment(request.text)
    return {"text_preview": request.text[:100], **result}


@router.post("/emotion")
def emotion_endpoint(request: TextRequest):
    result = analyze_emotion(request.text)
    return {"text_preview": request.text[:100], **result}