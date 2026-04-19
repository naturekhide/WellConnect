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

// GET /api/posts - Fetch all posts for feed
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        reactions: {
          select: {
            type: true,
            userId: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      take: 50, // Limit to 50 posts for now
    });

    // Transform posts to include reaction counts
    const transformedPosts = posts.map((post) => {
      const reactionCounts = {
        HUG: 0,
        GROWTH: 0,
        STRENGTH: 0,
        GRATEFUL: 0,
      };

      post.reactions.forEach((reaction) => {
        if (reaction.type in reactionCounts) {
          reactionCounts[reaction.type as keyof typeof reactionCounts]++;
        }
      });

      return {
        id: post.id,
        content: post.content,
        imageUrl: post.imageUrl,
        createdAt: post.createdAt,
        author: {
          name: post.user.name || "Anonymous",
          image: post.user.image,
        },
        reactions: {
          hug: reactionCounts.HUG,
          growth: reactionCounts.GROWTH,
          strength: reactionCounts.STRENGTH,
          grateful: reactionCounts.GRATEFUL,
        },
        commentCount: post._count.comments,
      };
    });

    return NextResponse.json(transformedPosts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content, groupId } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        groupId: groupId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      author: {
        name: post.user.name || "Anonymous",
        image: post.user.image,
      },
      reactions: {
        hug: 0,
        growth: 0,
        strength: 0,
        grateful: 0,
      },
      commentCount: 0,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}