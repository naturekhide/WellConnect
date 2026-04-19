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
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
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

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user already reacted
    const existingReaction = await prisma.reaction.findUnique({
      where: {
        userId_postId: {
          userId: session.user.id,
          postId,
        },
      },
    });

    if (existingReaction) {
      // Update existing reaction
      if (existingReaction.type === type) {
        // Remove reaction if same type clicked
        await prisma.reaction.delete({
          where: { id: existingReaction.id },
        });
      } else {
        // Change reaction type
        await prisma.reaction.update({
          where: { id: existingReaction.id },
          data: { type },
        });
      }
    } else {
      // Create new reaction
      await prisma.reaction.create({
        data: {
          type,
          userId: session.user.id,
          postId,
        },
      });
    }

    // Get updated reaction counts
    const reactions = await prisma.reaction.findMany({
      where: { postId },
    });

    const reactionCounts = {
      hug: reactions.filter((r) => r.type === "HUG").length,
      growth: reactions.filter((r) => r.type === "GROWTH").length,
      strength: reactions.filter((r) => r.type === "STRENGTH").length,
      grateful: reactions.filter((r) => r.type === "GRATEFUL").length,
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