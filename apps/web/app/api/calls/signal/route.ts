export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { getClient, setClient, removeClient } from "@/lib/call-clients";

export async function GET(request: NextRequest) {
  var userId = request.nextUrl.searchParams.get("userId");

  if (!userId) return new Response("Missing userId", { status: 400 });

  var stream = new ReadableStream({
    start(controller) {
      setClient(userId, controller);
      controller.enqueue("data: " + JSON.stringify({ type: "connected" }) + "\n\n");
      request.signal.addEventListener("abort", function() {
        removeClient(userId);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    var body = await request.json();
    var { to, signal } = body;

    var client = getClient(to);
    if (client) {
      client.enqueue("data: " + JSON.stringify(signal) + "\n\n");
      return new Response("OK", { status: 200 });
    }

    return new Response("User not connected", { status: 404 });
  } catch (e) {
    return new Response("Failed", { status: 500 });
  }
}