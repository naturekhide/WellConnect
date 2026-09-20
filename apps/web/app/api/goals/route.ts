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
  var { title, frequency } = body;

  if (!title || title.trim().length === 0) {
    return NextResponse.json({ error: "Title required" }, { status: 400 });
  }

  var userId = (session.user as any).id;

  var goal = await prisma.goal.create({
    data: {
      userId,
      title: title.trim(),
      frequency: frequency || "daily",
    },
  });

  return NextResponse.json(goal, { status: 201 });
}

export async function GET() {
  var session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  var userId = (session.user as any).id;

  var goals = await prisma.goal.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(goals);
}