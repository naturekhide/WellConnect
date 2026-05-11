import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

var prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var body = await request.json();
    var { mutedUserId } = body;
    if (!mutedUserId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

    var existing = await prisma.mutedConversation.findUnique({
      where: { userId_mutedUserId: { userId: token.sub, mutedUserId } },
    });

    if (existing) {
      await prisma.mutedConversation.delete({ where: { id: existing.id } });
      return NextResponse.json({ muted: false });
    } else {
      await prisma.mutedConversation.create({ data: { userId: token.sub, mutedUserId } });
      return NextResponse.json({ muted: true });
    }
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function GET(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var muted = await prisma.mutedConversation.findMany({
      where: { userId: token.sub },
      select: { mutedUserId: true },
    });

    return NextResponse.json({ mutedIds: muted.map(function(m: any) { return m.mutedUserId; }) });
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}