import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  var session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  var userId = (session.user as any).id;

  await prisma.goal.deleteMany({
    where: { id: params.id, userId },
  });

  return NextResponse.json({ success: true });
}