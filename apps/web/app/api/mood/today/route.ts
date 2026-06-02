import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

var prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var sub = token.sub;

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    var entry = await prisma.moodEntry.findFirst({
      where: {
        userId: sub,
        createdAt: { gte: today, lt: tomorrow },
      },
    });

    return NextResponse.json(entry);
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}