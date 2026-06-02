import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

export const dynamic = "force-dynamic";

var prisma = new PrismaClient();

// Initiate a call
export async function POST(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var sub = token.sub;
    var body = await request.json();
    var { recipientId, type, scope, groupId } = body;

    if (!recipientId && !groupId) return NextResponse.json({ error: "Recipient or group required" }, { status: 400 });
    if (!type || !["voice", "video"].includes(type)) return NextResponse.json({ error: "Type must be voice or video" }, { status: 400 });
    if (scope === "group" && type === "video") return NextResponse.json({ error: "Video calls not supported in groups" }, { status: 400 });

    var call = await prisma.call.create({
      data: {
        callerId: sub,
        type: type,
        scope: scope || "dm",
        groupId: groupId || null,
        status: "ringing",
        participants: {
          create: [
            { userId: sub, status: "joined" },
            ...(recipientId ? [{ userId: recipientId, status: "ringing" }] : []),
            ...(groupId ? (await getGroupMemberIds(groupId)).map(function(id: string) {
              return { userId: id, status: id === sub ? "joined" : "ringing" };
            }) : []),
          ],
        },
      },
      include: {
        caller: { select: { id: true, name: true, image: true } },
        participants: {
          include: { user: { select: { id: true, name: true, image: true } } },
        },
      },
    });

    // Notify recipients
    var recipients = call.participants.filter(function(p: any) { return p.userId !== sub; });
    for (var i = 0; i < recipients.length; i++) {
      var r = recipients[i];
      await prisma.notification.create({
        data: {
          userId: r.userId,
          type: "CALL",
          message: (call.type === "video" ? "📹 Video call" : "📞 Voice call") + " from " + (call.caller.name || "Someone"),
          link: "/messages/" + sub,
          fromUserId: sub,
        },
      });
    }

    return NextResponse.json(call, { status: 201 });
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

// Get call history
export async function GET(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var sub = token.sub;

    var calls = await prisma.call.findMany({
      where: {
        participants: { some: { userId: sub } },
      },
      include: {
        caller: { select: { id: true, name: true, image: true } },
        participants: {
          include: { user: { select: { id: true, name: true, image: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(calls);
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

async function getGroupMemberIds(groupId: string): Promise<string[]> {
  var members = await prisma.groupMember.findMany({
    where: { groupId: groupId },
    select: { userId: true },
  });
  return members.map(function(m: any) { return m.userId; });
}