import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    if (!token?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'all';

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ users: [], groups: [] });
    }

    const results: any = {};

    if (type === 'all' || type === 'users') {
      const users = await prisma.user.findMany({
        where: {
          id: { not: token.sub },
          OR: [
            { username: { contains: query } },
            { name: { contains: query } },
          ],
        },
        select: {
          id: true,
          name: true,
          username: true,
          image: true,
          bio: true,
          _count: {
            select: {
              posts: true,
              groupMembers: true,
            },
          },
        },
        take: 20,
      });

      results.users = users;
    }

    if (type === 'all' || type === 'groups') {
      const groups = await prisma.group.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
          ],
        },
        include: {
          _count: {
            select: {
              members: true,
              posts: true,
            },
          },
        },
        take: 20,
      });

      results.groups = groups;
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search" },
      { status: 500 }
    );
  }
}