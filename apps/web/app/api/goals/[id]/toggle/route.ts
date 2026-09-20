import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";

var prisma = new PrismaClient();

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  var session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  var userId = (session.user as any).id;

  var goal = await prisma.goal.findFirst({
    where: { id: params.id, userId },
  });

  if (!goal) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  var updated = await prisma.goal.update({
    where: { id: goal.id },
    data: {
      completed: !goal.completed,
      completedAt: !goal.completed ? new Date() : null,
    },
  });

  return NextResponse.json(updated);
}