import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

var prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var user = await prisma.user.findUnique({
      where: { id: token.sub },
      select: { readReceipts: true },
    });

    return NextResponse.json({ readReceipts: user?.readReceipts ?? true });
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function PUT(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var body = await request.json();
    var { readReceipts } = body;

    await prisma.user.update({
      where: { id: token.sub },
      data: { readReceipts },
    });

    return NextResponse.json({ readReceipts });
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}