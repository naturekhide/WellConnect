import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { extractAndSaveHashtags } from "@/lib/hashtags";
import { detectCrisisKeywords } from "@/lib/sentiment";
import { classifySentiment } from "@/lib/ai";

export const dynamic = "force-dynamic";

var prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var { searchParams } = new URL(request.url);
    var groupId = searchParams.get('groupId');
    var feed = searchParams.get('feed') || 'for-you';
    var sentiment = searchParams.get('sentiment');

    var whereClause: any = {};
    if (groupId) whereClause.groupId = groupId;
    else whereClause.groupId = null;

    if (sentiment && sentiment !== "all") {
      whereClause.sentiment = sentiment;
    }

    if (feed === 'following') {
      var following = await prisma.follow.findMany({ where: { followerId: token.sub }, select: { followingId: true } });
      var followingIds = following.map(function(f: any) { return f.followingId; });
      followingIds.push(token.sub);
      whereClause.userId = { in: followingIds };
    }

    if (feed === 'wellness') {
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      var todayEntry = await prisma.moodEntry.findFirst({
        where: { userId: token.sub, createdAt: { gte: today } },
      });

      var userMood = todayEntry?.label || "managing";

      var weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      var lowPosts = await prisma.post.count({
        where: { userId: token.sub, sentiment: "low", createdAt: { gte: weekAgo } },
      });

      var allPosts = await prisma.post.findMany({
        where: { groupId: null },
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, username: true, image: true } },
          reactions: { select: { type: true, userId: true } },
          poll: {
            include: {
              options: {
                include: {
                  _count: { select: { votes: true } },
                  votes: { where: { userId: token.sub }, select: { id: true } },
                },
              },
            },
          },
          hashtags: { include: { hashtag: true } },
          _count: { select: { comments: true } },
        },
        take: 100,
      });

      var scoredPosts = allPosts.map(function(post: any) {
        var score = 0;

        if ((userMood === "struggling" || userMood === "crisis" || lowPosts >= 2) && post.sentiment === "positive") {
          score += 30;
        }

        if (post.sentiment === "positive") score += 15;

        var reactionCount = post.reactions.length;
        score += Math.min(reactionCount * 2, 20);

        score += Math.min(post._count.comments * 3, 15);

        var hoursAgo = (Date.now() - new Date(post.createdAt).getTime()) / 3600000;
        if (hoursAgo < 6) score += 10;
        else if (hoursAgo < 24) score += 5;

        var growthReactions = post.reactions.filter(function(r: any) { return r.type === "GROWTH" || r.type === "STRENGTH"; }).length;
        score += growthReactions * 5;

        if ((userMood === "struggling" || userMood === "crisis") && post.sentiment === "low") {
          score -= 20;
        }

        return { ...post, wellnessScore: score };
      });

      scoredPosts.sort(function(a: any, b: any) { return b.wellnessScore - a.wellnessScore; });

      var transformedPosts = scoredPosts.slice(0, 50).map(function(post: any) {
        var rc: any = { HUG: 0, GROWTH: 0, STRENGTH: 0, GRATEFUL: 0 };
        post.reactions.forEach(function(r: any) { if (r.type in rc) rc[r.type]++; });
        return {
          id: post.id,
          content: post.content,
          imageUrl: post.imageUrl,
          videoUrl: post.videoUrl,
          poll: post.poll,
          hashtags: post.hashtags,
          sentiment: post.sentiment,
          createdAt: post.createdAt,
          author: { id: post.user.id, name: post.user.name || "Anonymous", username: post.user.username, image: post.user.image },
          reactions: { hug: rc.HUG, growth: rc.GROWTH, strength: rc.STRENGTH, grateful: rc.GRATEFUL },
          commentCount: post._count.comments,
        };
      });

      return NextResponse.json(transformedPosts);
    }

    var posts = await prisma.post.findMany({
      where: whereClause,
      orderBy: feed === 'trending' ? { reactions: { _count: "desc" } } : { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, username: true, image: true } },
        reactions: { select: { type: true, userId: true } },
        poll: {
          include: {
            options: {
              include: {
                _count: { select: { votes: true } },
                votes: { where: { userId: token.sub }, select: { id: true } },
              },
            },
          },
        },
        hashtags: { include: { hashtag: true } },
        _count: { select: { comments: true } },
      },
      take: 50,
    });

    var transformedPosts = posts.map(function(post: any) {
      var rc: any = { HUG: 0, GROWTH: 0, STRENGTH: 0, GRATEFUL: 0 };
      post.reactions.forEach(function(r: any) { if (r.type in rc) rc[r.type]++; });
      return {
        id: post.id,
        content: post.content,
        imageUrl: post.imageUrl,
        videoUrl: post.videoUrl,
        poll: post.poll,
        hashtags: post.hashtags,
        sentiment: post.sentiment,
        createdAt: post.createdAt,
        author: { id: post.user.id, name: post.user.name || "Anonymous", username: post.user.username, image: post.user.image },
        reactions: { hug: rc.HUG, growth: rc.GROWTH, strength: rc.STRENGTH, grateful: rc.GRATEFUL },
        commentCount: post._count.comments,
      };
    });

    return NextResponse.json(transformedPosts);
  } catch (e) {
    console.error("Error fetching posts:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var body = await request.json();
    var { content, groupId, imageUrl, videoUrl } = body;

    if ((!content || content.trim().length === 0) && !imageUrl && !videoUrl) {
      return NextResponse.json({ error: "Content required" }, { status: 400 });
    }

    var textContent = content?.trim() || "";

    // 🧠 AI-powered sentiment analysis (falls back to keyword if HF key missing)
    var aiResult = textContent ? await classifySentiment(textContent) : { sentiment: "neutral" as const, confidence: 1 };
    var sentiment = aiResult.sentiment;

    // Crisis detection still uses keywords (safety-critical)
    var isCrisis = textContent ? detectCrisisKeywords(textContent) : false;

    var post = await prisma.post.create({
      data: {
        content: textContent,
        userId: token.sub,
        groupId: groupId || null,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        sentiment: sentiment,
      },
      include: { user: { select: { id: true, name: true, username: true, image: true } } },
    });

    if (content && content.includes("#")) {
      try { await extractAndSaveHashtags(post.id, content); } catch (e) {}
    }

    if (isCrisis) {
      try {
        await prisma.moodInsight.create({
          data: {
            userId: token.sub,
            type: "crisis_alert",
            title: "We're here for you 💙",
            description: "It seems like you're going through a difficult time. You're not alone — reach out to someone you trust or explore our support resources.",
            actionLink: "/wellness?category=grief",
          },
        });
        await prisma.moodEntry.create({
          data: {
            userId: token.sub,
            score: 1,
            label: "crisis",
            source: "post_analysis",
            createdAt: new Date(),
          },
        });
      } catch (e) {}
    }

    if (sentiment === "low" && !isCrisis) {
      try {
        var todayEntry = await prisma.moodEntry.findFirst({
          where: {
            userId: token.sub,
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
              lt: new Date(new Date().setHours(23, 59, 59, 999)),
            },
          },
        });
        if (!todayEntry) {
          await prisma.moodEntry.create({
            data: {
              userId: token.sub,
              score: 3,
              label: "struggling",
              source: "post_analysis",
              createdAt: new Date(),
            },
          });
        }
      } catch (e) {}
    }

    return NextResponse.json({
      id: post.id, content: post.content, imageUrl: post.imageUrl, videoUrl: post.videoUrl,
      poll: null, sentiment: post.sentiment, createdAt: post.createdAt,
      author: { id: post.user.id, name: post.user.name || "Anonymous", username: post.user.username, image: post.user.image },
      reactions: { hug: 0, growth: 0, strength: 0, grateful: 0 }, commentCount: 0,
    }, { status: 201 });
  } catch (e) {
    console.error("Error creating post:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}