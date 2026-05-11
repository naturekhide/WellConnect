/**
 * Copyright 2026 Ibrahim Aswad Nindow
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";


const prisma = new PrismaClient();

async function createNotification({
  userId,
  type,
  message,
  link,
  fromUserId,
}: {
  userId: string;
  type: string;
  message: string;
  link?: string;
  fromUserId?: string;
}) {
  try {
    if (userId === fromUserId) return;
    await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        link: link || null,
        fromUserId: fromUserId || null,
      },
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

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

      // Create notification for post owner
      if (post.userId !== token.sub) {
        const reactionEmoji = {
          HUG: "🤗",
          GROWTH: "🌱",
          STRENGTH: "💪",
          GRATEFUL: "🙏",
        }[type];

        await createNotification({
          userId: post.userId,
          type: "REACTION",
          message: `Someone reacted with ${reactionEmoji} to your post`,
          link: "/feed",
          fromUserId: token.sub,
        });
      }
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