import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

var prisma = new PrismaClient();

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var reelId = params.id;
    var sub = token.sub;

    var existing = await prisma.bookmark.findUnique({
      where: { userId_postId: { userId: sub, postId: reelId } },
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      return NextResponse.json({ saved: false });
    } else {
      await prisma.bookmark.create({ data: { userId: sub, postId: reelId } });
      return NextResponse.json({ saved: true });
    }
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var existing = await prisma.bookmark.findUnique({
      where: { userId_postId: { userId: token.sub, postId: params.id } },
    });

    return NextResponse.json({ saved: !!existing });
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}