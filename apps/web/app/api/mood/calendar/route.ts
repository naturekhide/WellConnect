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

  var thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  var entries = await prisma.moodEntry.findMany({
    where: { userId, createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true, label: true, score: true },
  });

  // Format dates as YYYY-MM-DD for easy comparison
  var formatted = entries.map(function(e: any) {
    var d = new Date(e.createdAt);
    return {
      date: d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"),
      label: e.label,
      score: e.score,
    };
  });

  return NextResponse.json(formatted);
}