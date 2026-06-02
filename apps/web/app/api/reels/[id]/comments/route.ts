import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

var prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var comments = await prisma.comment.findMany({
      where: { postId: params.id },
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: { id: true, name: true, username: true, image: true } },
      },
    });

    return NextResponse.json(comments);
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var body = await request.json();
    var { content } = body;

    if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

    var comment = await prisma.comment.create({
      data: { content: content.trim(), userId: token.sub, postId: params.id },
      include: { user: { select: { id: true, name: true, username: true, image: true } } },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}