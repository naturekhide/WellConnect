import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";

var prisma = new PrismaClient();

export async function GET() {
  var session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  var userId = (session.user as any).id;
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  var entry = await prisma.moodEntry.findFirst({
    where: { userId, createdAt: { gte: today, lt: tomorrow } },
  });

  return NextResponse.json(entry);
}