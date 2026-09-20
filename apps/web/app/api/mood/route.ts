import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";

var prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  var session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  var body = await request.json();
  var { score, label, note } = body;

  if (!score || !label) {
    return NextResponse.json({ error: "Score and label required" }, { status: 400 });
  }

  var userId = (session.user as any).id;
  var today = new Date();
  today.setHours(0, 0, 0, 0);

  var entry = await prisma.moodEntry.upsert({
    where: {
      userId_createdAt: { userId, createdAt: today },
    },
    update: { score, label, note: note || null },
    create: { userId, score, label, note: note || null, createdAt: today },
  });

  return NextResponse.json(entry);
}

export async function GET(request: NextRequest) {
  var session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  var userId = (session.user as any).id;
  var days = parseInt(new URL(request.url).searchParams.get("days") || "30");

  var since = new Date();
  since.setDate(since.getDate() - days);

  var entries = await prisma.moodEntry.findMany({
    where: { userId, createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(entries);
}