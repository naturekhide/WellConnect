// Keyword-based sentiment analysis
// Positive words suggest good emotional state
// Low words suggest user might be struggling

var positiveWords = [
  "happy", "grateful", "blessed", "wonderful", "amazing", "love", "joy",
  "excited", "peaceful", "calm", "content", "hopeful", "proud", "thankful",
  "beautiful", "fantastic", "great", "good", "better", "best", "awesome",
  "thriving", "managing", "healing", "growing", "strong", "supported",
  "connected", "understood", "safe", "comfortable", "relaxed", "inspired"
];

var lowWords = [
  "sad", "lonely", "alone", "hopeless", "worthless", "empty", "numb",
  "exhausted", "overwhelmed", "anxious", "scared", "afraid", "worried",
  "struggling", "hurting", "pain", "lost", "confused", "stuck", "trapped",
  "angry", "frustrated", "depressed", "tired", "broken", "crying",
  "help", "need", "desperate", "drowning", "falling", "dark", "heavy"
];

export function analyzeSentiment(text: string): "positive" | "low" | "neutral" {
  var lower = text.toLowerCase();
  var positiveScore = 0;
  var lowScore = 0;

  for (var i = 0; i < positiveWords.length; i++) {
    if (lower.includes(positiveWords[i])) positiveScore++;
  }

  for (var j = 0; j < lowWords.length; j++) {
    if (lower.includes(lowWords[j])) lowScore++;
  }

  if (lowScore > positiveScore) return "low";
  if (positiveScore > lowScore) return "positive";
  return "neutral";
}

export function getUpliftingPosts(posts: any[], limit: number = 3): any[] {
  return posts
    .filter(function(p: any) { return p.sentiment === "positive"; })
    .slice(0, limit);
}

export function detectCrisisKeywords(text: string): boolean {
  var crisisWords = [
    "suicide", "kill myself", "end my life", "want to die", "better off dead",
    "self-harm", "hurt myself", "cut myself", "no reason to live",
    "can't go on", "give up", "end it all", "don't want to be here"
  ];

  var lower = text.toLowerCase();
  for (var i = 0; i < crisisWords.length; i++) {
    if (lower.includes(crisisWords[i])) return true;
  }
  return false;
}