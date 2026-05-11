import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

var prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var sub = token.sub;
    var postId = params.postId;
    var body = await request.json();
    var type = body.type;

    if (!["HUG", "GROWTH", "STRENGTH", "GRATEFUL"].includes(type)) {
      return NextResponse.json({ error: "Invalid reaction type" }, { status: 400 });
    }

    var post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    var existingReaction = await prisma.reaction.findUnique({
      where: { userId_postId: { userId: sub, postId } },
    });

    if (existingReaction) {
      if (existingReaction.type === type) {
        await prisma.reaction.delete({ where: { id: existingReaction.id } });
      } else {
        await prisma.reaction.update({ where: { id: existingReaction.id }, data: { type } });
      }
    } else {
      await prisma.reaction.create({ data: { type, userId: sub, postId } });

      // Notify post owner
      if (post.userId !== sub) {
        var emojiMap: any = { HUG: "🤗", GROWTH: "🌱", STRENGTH: "💪", GRATEFUL: "🙏" };
        try {
          await prisma.notification.create({
            data: {
              userId: post.userId,
              type: "REACTION",
              message: "Someone reacted with " + (emojiMap[type] || type) + " to your post",
              link: "/feed",
              fromUserId: sub,
            },
          });
        } catch (e) {}
      }
    }

    var reactions = await prisma.reaction.findMany({ where: { postId } });
    var counts: any = { hug: 0, growth: 0, strength: 0, grateful: 0 };
    reactions.forEach(function(r: any) {
      if (r.type === "HUG") counts.hug++;
      if (r.type === "GROWTH") counts.growth++;
      if (r.type === "STRENGTH") counts.strength++;
      if (r.type === "GRATEFUL") counts.grateful++;
    });

    return NextResponse.json(counts);
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}