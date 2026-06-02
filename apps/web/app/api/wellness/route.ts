import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

var prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var url = new URL(request.url);
    var category = url.searchParams.get("category");
    var mood = url.searchParams.get("mood");

    var where: any = {};

    if (category && category !== "all") {
      where.category = category;
    }

    if (mood) {
      where.moodTags = { contains: mood };
    }

    var articles = await prisma.wellnessArticle.findMany({
      where: where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(articles);
  } catch (e) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}