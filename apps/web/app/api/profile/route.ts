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

// GET /api/profile - Get current user's profile
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        image: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
            reactions: true,
            groupMembers: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's recent posts
    const recentPosts = await prisma.post.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        _count: {
          select: {
            reactions: true,
            comments: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      image: user.image,
      createdAt: user.createdAt,
      stats: {
        posts: user._count.posts,
        comments: user._count.comments,
        reactions: user._count.reactions,
        groups: user._count.groupMembers,
      },
      recentPosts,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PUT /api/profile - Update user's profile
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, bio } = body;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name?.trim() || null,
        bio: bio?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        image: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}