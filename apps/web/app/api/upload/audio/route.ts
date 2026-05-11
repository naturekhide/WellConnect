import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const allowedTypes = ["audio/webm", "audio/mp3", "audio/wav", "audio/ogg", "audio/mpeg", "audio/mp4"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid audio format" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Audio too large. Max 10MB." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueName = Date.now() + "-audio-" + cleanName;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "audio");
    
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, uniqueName), buffer);

    return NextResponse.json({ url: "/uploads/audio/" + uniqueName });
  } catch (error) {
    console.error("Audio upload error:", error);
    return NextResponse.json({ error: "Failed to upload" }, { status: 500 });
  }
}