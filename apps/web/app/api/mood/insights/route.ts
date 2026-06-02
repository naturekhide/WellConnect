import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { analyzeEmotion } from "@/lib/ai";

var prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var sub = token.sub;
    var insights: any[] = [];

    var twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    var entries = await prisma.moodEntry.findMany({
      where: { userId: sub, createdAt: { gte: twoWeeksAgo } },
      orderBy: { createdAt: "asc" },
    });

    var recentPosts = await prisma.post.findMany({
      where: { userId: sub, createdAt: { gte: twoWeeksAgo } },
      orderBy: { createdAt: "desc" },
      select: { sentiment: true, content: true, createdAt: true },
    });

    // AI Emotion Analysis on recent posts
    var postEmotions: string[] = [];
    for (var e = 0; e < Math.min(recentPosts.length, 5); e++) {
      var post = recentPosts[e];
      if (post.content) {
        try {
          var emotion = await analyzeEmotion(post.content);
          postEmotions.push(emotion.dominant);
        } catch (err) {}
      }
    }

    var lowPostCount = recentPosts.filter(function(p: any) { return p.sentiment === "low"; }).length;
    var positivePostCount = recentPosts.filter(function(p: any) { return p.sentiment === "positive"; }).length;

    var lastPost = await prisma.post.findFirst({
      where: { userId: sub },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    var lastMessage = await prisma.message.findFirst({
      where: { senderId: sub },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    var lastReaction = await prisma.reaction.findFirst({
      where: { userId: sub },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    var now = new Date();
    var lastActivity = lastPost?.createdAt || lastMessage?.createdAt || lastReaction?.createdAt;
    var daysSinceActivity = lastActivity
      ? Math.floor((now.getTime() - new Date(lastActivity).getTime()) / 86400000)
      : 999;

    // 1. Connection Gap
    if (daysSinceActivity >= 5 && (entries.length > 0 || recentPosts.length > 0)) {
      insights.push({
        type: "connection_gap",
        title: "You've been quiet lately",
        description: "It's been " + daysSinceActivity + " days since your last activity. Even a small check-in can help you feel connected.",
        actionLink: "/wellness?category=connection",
      });
    }

    // 2. AI Emotion Pattern — sadness dominant
    var sadnessCount = postEmotions.filter(function(em: string) { return em === "sadness"; }).length;
    var angerCount = postEmotions.filter(function(em: string) { return em === "anger"; }).length;
    var joyCount = postEmotions.filter(function(em: string) { return em === "joy"; }).length;

    if (sadnessCount >= 2 && postEmotions.length >= 2) {
      insights.push({
        type: "mood_shift",
        title: "You seem a bit down lately",
        description: "Your recent posts reflect some sadness. The community is here for you — consider checking out support resources.",
        actionLink: "/wellness?mood=struggling",
      });
    }

    // 3. AI Emotion Pattern — anger/frustration
    if (angerCount >= 2 && sadnessCount < 2) {
      insights.push({
        type: "mood_shift",
        title: "Feeling frustrated?",
        description: "Your recent posts show some frustration. Sometimes talking it through with others helps.",
        actionLink: "/groups",
      });
    }

    // 4. AI Emotion Pattern — joy dominant
    if (joyCount >= 3 && sadnessCount === 0 && angerCount === 0) {
      insights.push({
        type: "positive_trend",
        title: "You're radiating positive energy! 🌟",
        description: "Your recent posts reflect joy. Your energy lifts the community.",
        actionLink: "/profile",
      });
    }

    // 5. Post sentiment patterns
    if (lowPostCount >= 2 && recentPosts.length >= 3) {
      insights.push({
        type: "mood_shift",
        title: "Your recent posts seem heavy",
        description: "We've noticed your last few posts carry some weight. Here are some uplifting posts from the community.",
        actionLink: "/feed?sentiment=positive",
      });
    }

    if (positivePostCount >= 3 && lowPostCount === 0 && recentPosts.length >= 3) {
      insights.push({
        type: "positive_trend",
        title: "You're spreading positivity!",
        description: "Your recent posts have been uplifting. Your words make a difference in this community.",
        actionLink: "/profile",
      });
    }

    // 6. Mood shift from check-ins
    if (entries.length >= 4) {
      var mid = Math.floor(entries.length / 2);
      var firstHalf = entries.slice(0, mid);
      var secondHalf = entries.slice(mid);

      var firstAvg = firstHalf.reduce(function(s: number, entry: any) { return s + entry.score; }, 0) / firstHalf.length;
      var secondAvg = secondHalf.reduce(function(s: number, entry: any) { return s + entry.score; }, 0) / secondHalf.length;
      var difference = Math.round((secondAvg - firstAvg) * 10) / 10;

      if (difference <= -3) {
        var dominantLabel = getDominantLabel(secondHalf);
        insights.push({
          type: "mood_shift",
          title: "Your mood has shifted",
          description: "Your mood score dropped by " + Math.abs(difference) + " points recently. Others have found support in groups and articles.",
          actionLink: dominantLabel === "crisis" || dominantLabel === "struggling" ? "/wellness" : "/wellness",
        });
      }

      if (difference >= 3) {
        insights.push({
          type: "positive_trend",
          title: "You're on an upswing! 🌱",
          description: "Your mood has improved by " + difference + " points over the past week. Whatever you're doing, it's working.",
          actionLink: "/profile",
        });
      }
    }

    // 7. Engagement pattern nudges
    try {
      var patternRes = await fetch(new URL("/api/patterns", request.url).toString(), {
        headers: { Cookie: request.headers.get("cookie") || "" },
      });
      if (patternRes.ok) {
        var patternData = await patternRes.json();
        if (patternData.insights && patternData.insights.length > 0) {
          patternData.insights.forEach(function(pi: any) {
            insights.push(pi);
          });
        }
      }
    } catch (err) {}

    // 8. Content recommendation
    var shouldRecommendContent = entries.length >= 2
      ? entries.slice(-2).every(function(entry: any) { return entry.score <= 5; })
      : lowPostCount >= 2 || sadnessCount >= 2;

    if (shouldRecommendContent) {
      var articles = await prisma.wellnessArticle.findMany({
        where: { moodTags: { contains: "struggling" } },
        take: 1,
        orderBy: { createdAt: "desc" },
      });

      if (articles.length > 0) {
        insights.push({
          type: "content_match",
          title: "Something that might help",
          description: articles[0].title + " — " + articles[0].readTime + " min read",
          actionLink: "/wellness",
        });
      }
    }

    // 9. Group recommendation
    if ((entries.length >= 2 && getDominantLabel(entries) === "struggling") || lowPostCount >= 2 || sadnessCount >= 2) {
      var groups = await prisma.group.findMany({ take: 1, orderBy: { members: { _count: "desc" } } });

      if (groups.length > 0) {
        insights.push({
          type: "content_match",
          title: "You might like this group",
          description: "People with similar experiences have found support in " + groups[0].name + ".",
          actionLink: "/groups",
        });
      }
    }

    // Save insights
    var savedInsights: any[] = [];
    for (var i = 0; i < insights.length; i++) {
      var insight = insights[i];
      var threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      var existing = await prisma.moodInsight.findFirst({
        where: { userId: sub, type: insight.type, title: insight.title, createdAt: { gte: threeDaysAgo } },
      });

      if (!existing) {
        var saved = await prisma.moodInsight.create({
          data: {
            userId: sub,
            type: insight.type,
            title: insight.title,
            description: insight.description,
            actionLink: insight.actionLink || null,
          },
        });
        savedInsights.push(saved);
      }
    }

    return NextResponse.json({ generated: savedInsights.length, insights: savedInsights });
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function GET(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var sub = token.sub;
    var insights = await prisma.moodInsight.findMany({
      where: { userId: sub, dismissed: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json(insights);
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function PUT(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var body = await request.json();
    var { insightId } = body;

    if (!insightId) return NextResponse.json({ error: "Insight ID required" }, { status: 400 });

    await prisma.moodInsight.update({ where: { id: insightId }, data: { dismissed: true } });

    return NextResponse.json({ success: true });
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

function getDominantLabel(entries: any[]) {
  var counts: any = { thriving: 0, managing: 0, struggling: 0, crisis: 0 };
  entries.forEach(function(entry: any) { if (entry.label in counts) counts[entry.label]++; });
  return Object.entries(counts).sort(function(a: any, b: any) { return b[1] - a[1]; })[0][0];
}