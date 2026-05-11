import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { pollId: string } }
) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var body = await request.json();
    var { optionId } = body;
    var pollId = params.pollId;

    var existingVote = await prisma.pollVote.findFirst({
      where: {
        userId: token.sub,
        option: { pollId: pollId },
      },
    });

    if (existingVote) {
      await prisma.pollVote.delete({ where: { id: existingVote.id } });
    }

    await prisma.pollVote.create({
      data: { optionId, userId: token.sub },
    });

    var poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: {
          include: {
            _count: { select: { votes: true } },
            votes: { where: { userId: token.sub }, select: { id: true } },
          },
        },
      },
    });

    return NextResponse.json(poll);
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}