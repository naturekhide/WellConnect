import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
    var userId = await getCurrentUserId(request);
    if (!userId) return new Response("Unauthorized", { status: 401 });

    var otherId = params.userId;

    // Set up the Server-Sent Events stream
    var responseStream = new ReadableStream({
        start(controller) {
            var encoder = new TextEncoder();

            // Keep track of the last message timestamp to avoid duplicates
            var lastChecked = new Date();

            // Poll the DB every 1 second and push to the client
            var interval = setInterval(async function () {
                try {
                    var newMessages = await prisma.directMessage.findMany({
                        where: {
                            OR: [
                                // 👇 Forced casting to string to fix TS2322
                                { senderId: userId as string, receiverId: otherId as string },
                                { senderId: otherId as string, receiverId: userId as string },
                            ],
                            deletedAt: null,
                            createdAt: { gt: lastChecked },
                        },
                        include: {
                            sender: { select: { id: true, name: true, username: true } },
                        },
                        orderBy: { createdAt: "asc" },
                    });

                    if (newMessages.length > 0) {
                        // Update the timestamp
                        lastChecked = new Date(newMessages[newMessages.length - 1].createdAt);

                        // Send the new messages to the phone
                        var data = `data: ${JSON.stringify(newMessages)}\n\n`;
                        controller.enqueue(encoder.encode(data));
                    }
                } catch (e) {
                    console.error("SSE Error:", e);
                }
            }, 1000); // Checks the database every 1 second

            // Clean up when the phone disconnects
            request.signal.addEventListener("abort", function () {
                clearInterval(interval);
                try {
                    controller.close();
                } catch (e) { } // Ignore if already closed
            });
        }
    });

    return new Response(responseStream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
        },
    });
}