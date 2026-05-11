import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var body = await request.json();
    var { question, options, groupId } = body;

    if (!question || !options || options.length < 2) {
      return NextResponse.json({ error: "Question and at least 2 options required" }, { status: 400 });
    }

    var post = await prisma.post.create({
      data: {
        content: "📊 " + question,
        userId: token.sub,
        groupId: groupId || null,
      },
    });

    var poll = await prisma.poll.create({
      data: {
        question,
        postId: post.id,
        options: {
          create: options.map(function(opt: string) {
            return { text: opt };
          }),
        },
      },
      include: {
        options: true,
      },
    });

    return NextResponse.json({ post: { id: post.id, content: post.content, createdAt: post.createdAt }, poll: poll }, { status: 201 });
  } catch (error) {
    console.error("Poll error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}