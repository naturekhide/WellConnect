import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { getClient } from "@/lib/call-clients";

var prisma = new PrismaClient();

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var sub = token.sub;
    var callId = params.id;
    var body = await request.json();
    var { action } = body;

    var call = await prisma.call.findUnique({ where: { id: callId } });
    if (!call) return NextResponse.json({ error: "Call not found" }, { status: 404 });

    var participant = await prisma.callParticipant.findUnique({
      where: { callId_userId: { callId: callId, userId: sub } },
    });
    if (!participant) return NextResponse.json({ error: "Not a participant" }, { status: 403 });

    if (action === "accept") {
      await prisma.callParticipant.update({
        where: { callId_userId: { callId: callId, userId: sub } },
        data: { status: "joined", joinedAt: new Date() },
      });
      if (call.status === "ringing") {
        await prisma.call.update({
          where: { id: callId },
          data: { status: "ongoing", startedAt: new Date() },
        });
      }

      var allParticipants = await prisma.callParticipant.findMany({
        where: { callId: callId },
        select: { userId: true },
      });
      for (var i = 0; i < allParticipants.length; i++) {
        var p = allParticipants[i];
        var client = getClient(p.userId);
        if (client) {
          client.enqueue("data: " + JSON.stringify({ type: "call-started", callId: callId }) + "\n\n");
        }
      }

    } else if (action === "reject") {
      await prisma.callParticipant.update({
        where: { callId_userId: { callId: callId, userId: sub } },
        data: { status: "rejected" },
      });
      var ringingCount = await prisma.callParticipant.count({
        where: { callId: callId, status: "ringing" },
      });
      if (ringingCount === 0) {
        var joinedCount = await prisma.callParticipant.count({
          where: { callId: callId, status: "joined" },
        });
        if (joinedCount <= 1) {
          await prisma.call.update({
            where: { id: callId },
            data: { status: "rejected", endedAt: new Date() },
          });
        }
      }

    } else if (action === "end") {
      await prisma.callParticipant.updateMany({
        where: { callId: callId, status: "ringing" },
        data: { status: "missed" },
      });
      await prisma.callParticipant.update({
        where: { callId_userId: { callId: callId, userId: sub } },
        data: { status: "left", leftAt: new Date() },
      });
      await prisma.call.update({
        where: { id: callId },
        data: { status: "ended", endedAt: new Date() },
      });

      var remainingParticipants = await prisma.callParticipant.findMany({
        where: { callId: callId, userId: { not: sub }, status: "joined" },
      });
      for (var j = 0; j < remainingParticipants.length; j++) {
        var rp = remainingParticipants[j];
        await prisma.callParticipant.update({
          where: { callId_userId: { callId: callId, userId: rp.userId } },
          data: { status: "left", leftAt: new Date() },
        });
      }
    }

    var updatedCall = await prisma.call.findUnique({
      where: { id: callId },
      include: {
        caller: { select: { id: true, name: true, image: true } },
        participants: {
          include: { user: { select: { id: true, name: true, image: true } } },
        },
      },
    });

    return NextResponse.json(updatedCall);
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var call = await prisma.call.findUnique({
      where: { id: params.id },
      include: {
        caller: { select: { id: true, name: true, image: true } },
        participants: {
          include: { user: { select: { id: true, name: true, image: true } } },
        },
      },
    });

    if (!call) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(call);
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}