var OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
var OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

// Simple in-memory cache to avoid duplicate API calls
var cache: Record<string, any> = {};
var CACHE_TTL = 60000; // 1 minute

function getCached(key: string): any | null {
  var entry = cache[key];
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  delete cache[key];
  return null;
}

function setCache(key: string, data: any) {
  cache[key] = { data: data, timestamp: Date.now() };
}

// Rate limiting
var lastCallTime = 0;
var MIN_INTERVAL = 1000; // 1 second between calls

async function rateLimitedCall(url: string, options: any): Promise<Response> {
  var now = Date.now();
  var timeSinceLastCall = now - lastCallTime;
  if (timeSinceLastCall < MIN_INTERVAL) {
    await new Promise(function(resolve) { setTimeout(resolve, MIN_INTERVAL - timeSinceLastCall); });
  }
  lastCallTime = Date.now();
  return fetch(url, options);
}

export async function analyzeEmotion(text: string): Promise<{
  dominant: string;
  scores: Record<string, number>;
}> {
  if (!OPENAI_API_KEY) {
    return fallbackEmotion(text);
  }

  // Check cache
  var cacheKey = "emotion:" + text.substring(0, 100);
  var cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    var res = await rateLimitedCall(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + OPENAI_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an emotional analysis engine. Analyze the text and return ONLY a JSON object with emotion scores (0-1) for: joy, sadness, anger, fear, love, surprise. No other text."
          },
          {
            role: "user",
            content: text.substring(0, 500)
          }
        ],
        temperature: 0.1,
        max_tokens: 100,
      }),
    });

    if (!res.ok) {
      if (res.status === 429) {
        console.log("Rate limited, using fallback");
        return fallbackEmotion(text);
      }
      throw new Error("OpenAI API error: " + res.status);
    }

    var data = await res.json();
    var content = data.choices[0].message.content;

    var scores: Record<string, number> = {};
    try {
      scores = JSON.parse(content);
    } catch (e) {
      var match = content.match(/\{[\s\S]*\}/);
      if (match) scores = JSON.parse(match[0]);
    }

    var dominant = Object.entries(scores).sort(function(a: any, b: any) {
      return b[1] - a[1];
    })[0][0] || "neutral";

    var result = { dominant, scores };
    setCache(cacheKey, result);
    return result;
  } catch (e) {
    console.error("AI emotion analysis failed:", e);
    return fallbackEmotion(text);
  }
}

export async function classifySentiment(text: string): Promise<{
  sentiment: "positive" | "low" | "neutral";
  confidence: number;
}> {
  if (!OPENAI_API_KEY) {
    return fallbackSentiment(text);
  }

  // Check cache
  var cacheKey = "sentiment:" + text.substring(0, 100);
  var cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    var res = await rateLimitedCall(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + OPENAI_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Classify the emotional sentiment of this text. Return ONLY one word: positive, low, or neutral. No other text."
          },
          {
            role: "user",
            content: text.substring(0, 500)
          }
        ],
        temperature: 0.1,
        max_tokens: 10,
      }),
    });

    if (!res.ok) {
      if (res.status === 429) {
        console.log("Rate limited, using fallback");
        return fallbackSentiment(text);
      }
      throw new Error("OpenAI API error: " + res.status);
    }

    var data = await res.json();
    var result = data.choices[0].message.content.trim().toLowerCase();

    var sentiment: "positive" | "low" | "neutral" = "neutral";
    if (result.includes("positive")) sentiment = "positive";
    else if (result.includes("low")) sentiment = "low";

    var output = { sentiment, confidence: 0.9 };
    setCache(cacheKey, output);
    return output;
  } catch (e) {
    console.error("AI sentiment analysis failed:", e);
    return fallbackSentiment(text);
  }
}

export async function getWellnessRecommendation(
  moodLabel: string,
  recentEmotions: string[]
): Promise<{ title: string; description: string; actionLink: string } | null> {
  if (!OPENAI_API_KEY) return null;

  var cacheKey = "rec:" + moodLabel + ":" + recentEmotions.join(",");
  var cached = getCached(cacheKey);
  if (cached) return cached;

  try {
    var res = await rateLimitedCall(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + OPENAI_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a compassionate wellness coach. Give a short, warm, personalized recommendation based on the user's mood. Keep it under 100 characters. Return ONLY the recommendation text."
          },
          {
            role: "user",
            content: "Mood: " + moodLabel + ". Recent emotions: " + recentEmotions.join(", ") + "."
          }
        ],
        temperature: 0.7,
        max_tokens: 60,
      }),
    });

    if (!res.ok) return null;

    var data = await res.json();
    var suggestion = data.choices[0].message.content.trim();

    var result = {
      title: "A note for you",
      description: suggestion,
      actionLink: "/wellness",
    };
    setCache(cacheKey, result);
    return result;
  } catch (e) {
    return null;
  }
}

// Fallback: keyword-based emotion detection
function fallbackEmotion(text: string) {
  var lower = text.toLowerCase();
  var scores: Record<string, number> = { joy: 0, sadness: 0, anger: 0, fear: 0, love: 0, surprise: 0 };

  var emotionMap: Record<string, string> = {
    happy: "joy", glad: "joy", excited: "joy", wonderful: "joy", amazing: "joy", great: "joy", awesome: "joy", love: "love", grateful: "love", blessed: "love",
    sad: "sadness", lonely: "sadness", alone: "sadness", depressed: "sadness", crying: "sadness", hopeless: "sadness", empty: "sadness",
    angry: "anger", frustrated: "anger", furious: "anger", annoyed: "anger",
    scared: "fear", afraid: "fear", anxious: "fear", worried: "fear", terrified: "fear", nervous: "fear",
    surprised: "surprise", shocked: "surprise",
  };

  Object.entries(emotionMap).forEach(function(entry: any) {
    if (lower.includes(entry[0])) scores[entry[1]]++;
  });

  var dominant = Object.entries(scores).sort(function(a: any, b: any) { return b[1] - a[1]; })[0][0];
  return { dominant, scores };
}

function fallbackSentiment(text: string): { sentiment: "positive" | "low" | "neutral"; confidence: number } {
  var positiveWords = ["happy", "grateful", "blessed", "wonderful", "amazing", "love", "joy", "excited", "peaceful", "great", "good", "awesome", "thriving"];
  var lowWords = ["sad", "lonely", "alone", "hopeless", "anxious", "scared", "struggling", "depressed", "tired", "broken", "angry", "lost"];

  var lower = text.toLowerCase();
  var positiveScore = 0;
  var lowScore = 0;

  positiveWords.forEach(function(w: string) { if (lower.includes(w)) positiveScore++; });
  lowWords.forEach(function(w: string) { if (lower.includes(w)) lowScore++; });

  if (lowScore > positiveScore) return { sentiment: "low", confidence: 0.7 };
  if (positiveScore > lowScore) return { sentiment: "positive", confidence: 0.7 };
  return { sentiment: "neutral", confidence: 0.5 };
}