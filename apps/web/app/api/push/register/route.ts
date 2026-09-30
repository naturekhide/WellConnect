import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

var prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  var userId = await getCurrentUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  var body = await request.json();
  var { token } = body;

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { expoPushToken: token },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  var userId = await getCurrentUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { expoPushToken: null },
  });

  return NextResponse.json({ success: true });
}