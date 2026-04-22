import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { AUTH_SECRET } from "@/lib/auth-config";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
   const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    if (!token?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = params;
    const body = await request.json();
    const { type } = body;

    if (!["HUG", "GROWTH", "STRENGTH", "GRATEFUL"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid reaction type" },
        { status: 400 }
      );
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const existingReaction = await prisma.reaction.findUnique({
      where: {
        userId_postId: {
          userId: token.sub,
          postId,
        },
      },
    });

    if (existingReaction) {
      if (existingReaction.type === type) {
        await prisma.reaction.delete({
          where: { id: existingReaction.id },
        });
      } else {
        await prisma.reaction.update({
          where: { id: existingReaction.id },
          data: { type },
        });
      }
    } else {
      await prisma.reaction.create({
        data: {
          type,
          userId: token.sub,
          postId,
        },
      });
    }

    const reactions = await prisma.reaction.findMany({
      where: { postId },
    });

    const reactionCounts = {
      hug: reactions.filter((r: any) => r.type === "HUG").length,
      growth: reactions.filter((r: any) => r.type === "GROWTH").length,
      strength: reactions.filter((r: any) => r.type === "STRENGTH").length,
      grateful: reactions.filter((r: any) => r.type === "GRATEFUL").length,
    };

    return NextResponse.json(reactionCounts);
  } catch (error) {
    console.error("Error handling reaction:", error);
    return NextResponse.json(
      { error: "Failed to process reaction" },
      { status: 500 }
    );
  }
}