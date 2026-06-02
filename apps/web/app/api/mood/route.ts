import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

var prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var sub = token.sub;
    var body = await request.json();
    var { score, label, note } = body;

    if (!score || !label) return NextResponse.json({ error: "Score and label are required" }, { status: 400 });
    if (score < 1 || score > 10) return NextResponse.json({ error: "Score must be between 1 and 10" }, { status: 400 });

    var validLabels = ["thriving", "managing", "struggling", "crisis"];
    if (!validLabels.includes(label)) return NextResponse.json({ error: "Invalid label" }, { status: 400 });

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var entry = await prisma.moodEntry.upsert({
      where: {
        userId_createdAt: {
          userId: sub,
          createdAt: today,
        },
      },
      update: { score, label, note: note || null },
      create: { userId: sub, score, label, note: note || null, createdAt: today },
    });

    // Record engagement pattern
    try {
      await fetch(new URL("/api/patterns", request.url).toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("cookie") || "",
        },
        body: JSON.stringify({ action: "checkin" }),
      });
    } catch (e) {}

    return NextResponse.json(entry);
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function GET(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var sub = token.sub;
    var url = new URL(request.url);
    var days = parseInt(url.searchParams.get("days") || "30");
    var limit = Math.min(days, 365);

    var since = new Date();
    since.setDate(since.getDate() - limit);

    var entries = await prisma.moodEntry.findMany({
      where: { userId: sub, createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(entries);
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}