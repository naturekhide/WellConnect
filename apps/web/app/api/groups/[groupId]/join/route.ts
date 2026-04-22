import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { AUTH_SECRET } from "@/lib/auth-config";

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET
    });
    if (!token?.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId } = params;

    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const existingMember = await prisma.groupMember.findUnique({
      where: {
        userId_groupId: {
          userId: token.sub,
          groupId,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Already a member" },
        { status: 400 }
      );
    }

    await prisma.groupMember.create({
      data: {
        userId: token.sub,
        groupId,
        role: "MEMBER",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error joining group:", error);
    return NextResponse.json(
      { error: "Failed to join group" },
      { status: 500 }
    );
  }
}