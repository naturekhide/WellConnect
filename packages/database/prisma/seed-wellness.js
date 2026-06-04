var { PrismaClient } = require("@prisma/client");

var prisma = new PrismaClient();

var articles = [
  {
    title: "5 Grounding Techniques for When Anxiety Hits",
    content: "Anxiety can feel overwhelming, but grounding techniques bring you back to the present moment. Here are five proven methods:\n\n**1. The 5-4-3-2-1 Method**\nAcknowledge 5 things you see, 4 things you can touch, 3 things you hear, 2 things you can smell, and 1 thing you can taste. This engages all your senses and pulls you out of anxious thoughts.\n\n**2. Box Breathing**\nInhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, hold for 4 seconds. Repeat this cycle 4 times. Navy SEALs use this technique to stay calm under pressure.\n\n**3. Body Scan**\nClose your eyes and slowly focus on each part of your body, starting from your toes up to your head. Notice any tension and consciously release it.\n\n**4. Cold Water Splash**\nSplash cold water on your face or hold an ice cube. The shock activates your dive reflex and slows your heart rate.\n\n**5. Name the Object**\nPick a color and name every object in the room that is that color. This redirects your brain from panic to observation.\n\nPractice these when you're calm so they become automatic when anxiety strikes.",
    category: "anxiety",
    moodTags: "struggling,crisis",
    readTime: 4,
    authorName: "Dr. Sarah Chen",
    authorType: "therapist",
  },
  {
    title: "Understanding Grief: There's No Right Way to Heal",
    content: "Grief isn't linear. Some days you feel okay, other days you can barely function — and both are normal.\n\n**The Reality of Grief**\nGrief doesn't follow stages in order. You might feel anger, then acceptance, then anger again. You might skip denial entirely. There's no correct sequence.\n\n**Common Experiences**\n- Waves of sadness that come without warning\n- Feeling guilty for laughing or enjoying something\n- Physical symptoms like fatigue, headaches, or appetite changes\n- Difficulty concentrating or making decisions\n\n**What Helps**\n- Talk about the person you lost. Say their name.\n- Create small rituals: light a candle, visit a special place\n- Join a support group — connecting with others who understand reduces isolation\n- Be patient with yourself. Healing isn't a race\n\n**When to Seek Support**\nIf grief interferes with daily functioning for more than a few weeks, or if you have thoughts of joining the person you lost, reach out to a professional immediately.",
    category: "grief",
    moodTags: "struggling,crisis",
    readTime: 5,
    authorName: "Michael Torres, LCSW",
    authorType: "therapist",
  },
  {
    title: "Burnout Recovery: Recognizing the Signs and Coming Back",
    content: "Burnout isn't just being tired — it's a state of emotional, physical, and mental exhaustion caused by prolonged stress.\n\n**Signs You're Burned Out**\n- Feeling drained most of the time\n- Cynicism or detachment from work or relationships\n- Reduced performance despite working harder\n- Physical symptoms like headaches, stomach issues, or frequent illness\n\n**The Recovery Path**\n\n**1. Acknowledge it** — Denial prolongs burnout. Name it.\n\n**2. Set boundaries** — Say no to non-essential commitments. Protect your energy.\n\n**3. Reconnect with meaning** — What made you passionate in the first place? Reconnect with that.\n\n**4. Rest deeply** — Not just sleep, but activities that truly restore you: nature walks, hobbies, time with loved ones.\n\n**5. Seek support** — Talk to a therapist, a trusted friend, or a support group.\n\n**Prevention**\nBuild habits that protect against burnout: regular breaks, exercise, creative outlets, and meaningful social connection.",
    category: "stress",
    moodTags: "managing,struggling",
    readTime: 6,
    authorName: "Aisha Patel",
    authorType: "coach",
  },
  {
    title: "The Science of Self-Compassion",
    content: "We're often our own harshest critics. Self-compassion isn't self-pity or self-indulgence — it's treating yourself with the same kindness you'd offer a friend.\n\n**Three Elements of Self-Compassion**\n\n**1. Self-Kindness vs. Self-Judgment**\nWhen you fail, do you comfort yourself or attack yourself? Self-kindness means responding with warmth, not criticism.\n\n**2. Common Humanity vs. Isolation**\nEveryone struggles. You're not alone in your pain. Recognizing this reduces shame and isolation.\n\n**3. Mindfulness vs. Over-Identification**\nObserve your thoughts and feelings without being consumed by them. You can acknowledge pain without becoming it.\n\n**A Simple Practice**\nWhen you notice self-criticism, pause. Place your hand on your chest. Ask yourself: \"What would I say to a friend feeling this way?\" Then say that to yourself.\n\nResearch shows self-compassion reduces anxiety, depression, and increases resilience. It's not selfish — it's essential.",
    category: "self-compassion",
    moodTags: "struggling,managing",
    readTime: 5,
    authorName: "Dr. James Kim",
    authorType: "therapist",
  },
  {
    title: "Why Connection Matters: The Antidote to Loneliness",
    content: "Loneliness isn't about being alone — it's about feeling disconnected. You can be in a crowded room and still feel isolated.\n\n**The Health Impact**\nChronic loneliness affects physical health as much as smoking 15 cigarettes a day. It increases inflammation, heart disease risk, and depression.\n\n**Small Steps to Reconnect**\n\n- **Start small** — A brief conversation with a barista or neighbor counts\n- **Join a group** — Shared interests create natural connection\n- **Reach out to old friends** — A simple \"thinking of you\" text opens doors\n- **Volunteer** — Helping others reduces isolation and builds purpose\n- **Be vulnerable** — Real connection requires honesty about how you're doing\n\n**Online Communities Count**\nWellConnect groups are real connections. Engage, share, respond. Every interaction builds your support network.\n\nConnection isn't a luxury — it's a human need. Start where you are.",
    category: "connection",
    moodTags: "managing,struggling",
    readTime: 4,
    authorName: "Rachel Okonkwo",
    authorType: "peer",
  },
  {
    title: "Sleep Hygiene: Small Changes, Big Impact",
    content: "Quality sleep is the foundation of mental health. Poor sleep worsens anxiety, depression, and stress — while good sleep enhances everything.\n\n**The Sleep-Mood Connection**\nDuring sleep, your brain processes emotions and consolidates memories. Without enough REM sleep, emotional regulation suffers.\n\n**10 Sleep Hygiene Tips**\n\n1. **Consistent schedule** — Same bedtime and wake time, even on weekends\n2. **Morning sunlight** — 10-15 minutes of morning light regulates your circadian rhythm\n3. **No screens 1 hour before bed** — Blue light suppresses melatonin\n4. **Cool bedroom** — 65-68°F (18-20°C) is optimal\n5. **No caffeine after 2pm**\n6. **Wind-down routine** — Reading, gentle stretching, or journaling\n7. **Exercise regularly** — But not right before bed\n8. **Limit alcohol** — It disrupts REM sleep\n9. **Write down worries** — Get them out of your head before bed\n10. **Get up if you can't sleep** — Don't lie awake for more than 20 minutes\n\nStart with just 2-3 changes. Consistency matters more than perfection.",
    category: "sleep",
    moodTags: "managing,struggling",
    readTime: 5,
    authorName: "Dr. Lisa Park",
    authorType: "therapist",
  },
  {
    title: "Mindfulness for People Who Can't Meditate",
    content: "Not everyone can sit still and focus on their breath — and that's okay. Mindfulness doesn't require meditation.\n\n**What Mindfulness Actually Is**\nPaying attention to the present moment without judgment. That's it. You can do it anywhere.\n\n**5 Non-Meditation Mindfulness Practices**\n\n**1. Mindful Walking**\nNotice the sensation of your feet hitting the ground. Feel the air on your skin. Observe the colors around you.\n\n**2. Single-Tasking**\nDo one thing at a time. When eating, just eat. When washing dishes, just wash dishes. Notice the sensations.\n\n**3. The 60-Second Pause**\nSet a timer for 60 seconds. Close your eyes. Notice what you hear. Feel your heartbeat. Then continue your day.\n\n**4. Mindful Listening**\nIn conversation, focus entirely on the other person. Notice their tone, pace, and emotion without planning your response.\n\n**5. Gratitude Noticing**\nOnce a day, pause and identify one thing you appreciate — the warmth of coffee, sunlight through a window, a kind message.\n\nMindfulness isn't about emptying your mind. It's about being here, now.",
    category: "mindfulness",
    moodTags: "thriving,managing,struggling",
    readTime: 4,
    authorName: "Jordan West",
    authorType: "coach",
  },
  {
    title: "Building Resilience: Bouncing Back After Hard Times",
    content: "Resilience isn't about being tough or unaffected. It's about adapting, recovering, and growing through difficulty.\n\n**The Resilience Framework**\n\n**1. Connection**\nStrong relationships are the #1 predictor of resilience. Nurture your support network before you need it.\n\n**2. Purpose**\nHaving a reason to get up — whether work, family, creativity, or service — provides an anchor during storms.\n\n**3. Flexibility**\nRigid thinking breaks under pressure. Practice seeing situations from multiple perspectives.\n\n**4. Self-Care**\nPhysical health underpins mental resilience. Sleep, nutrition, and movement aren't optional.\n\n**5. Meaning-Making**\nAfter difficulty, ask: \"What did I learn? How did I grow?\" This transforms pain into wisdom.\n\n**Daily Resilience Builders**\n- Keep a \"wins journal\" — write 3 things you handled well each day\n- Practice reframing: \"This is hard\" becomes \"This is hard, and I'm building strength\"\n- Celebrate small victories\n\nResilience is a skill. Every challenge is practice.",
    category: "self-compassion",
    moodTags: "thriving,managing,struggling",
    readTime: 5,
    authorName: "Dr. Marcus Webb",
    authorType: "therapist",
  },
];

async function main() {
  console.log("Seeding wellness articles...");

  for (var i = 0; i < articles.length; i++) {
    var article = articles[i];
    await prisma.wellnessArticle.upsert({
      where: { id: article.title },
      update: article,
      create: article,
    });
  }

  console.log("Wellness articles seeded:", articles.length);
}

main()
  .catch(function(e) { console.error(e); process.exit(1); })
  .finally(function() { prisma.$disconnect(); });