var AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";

export async function classifySentiment(text: string): Promise<{
  sentiment: "positive" | "low" | "neutral";
  confidence: number;
}> {
  try {
    var res = await fetch(AI_SERVICE_URL + "/analyze/sentiment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text }),
    });

    if (!res.ok) return fallbackSentiment(text);

    var data = await res.json();
    return {
      sentiment: data.sentiment as "positive" | "low" | "neutral",
      confidence: data.confidence || 0.8,
    };
  } catch (e) {
    console.error("AI sentiment failed:", e);
    return fallbackSentiment(text);
  }
}

export async function analyzeEmotion(text: string): Promise<{
  dominant: string;
  scores: Record<string, number>;
}> {
  try {
    var res = await fetch(AI_SERVICE_URL + "/analyze/emotion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text }),
    });

    if (!res.ok) return { dominant: "neutral", scores: {} };

    var data = await res.json();
    return { dominant: data.dominant, scores: data.scores };
  } catch (e) {
    return { dominant: "neutral", scores: {} };
  }
}

function fallbackSentiment(text: string): { sentiment: "positive" | "low" | "neutral"; confidence: number } {
  var positiveWords = ["happy", "grateful", "blessed", "wonderful", "amazing", "love", "joy"];
  var lowWords = ["sad", "lonely", "alone", "hopeless", "struggling", "depressed"];

  var lower = text.toLowerCase();
  var pos = 0;
  var low = 0;

  positiveWords.forEach(function(w) { if (lower.includes(w)) pos++; });
  lowWords.forEach(function(w) { if (lower.includes(w)) low++; });

  if (low > pos) return { sentiment: "low", confidence: 0.7 };
  if (pos > low) return { sentiment: "positive", confidence: 0.7 };
  return { sentiment: "neutral", confidence: 0.5 };
}