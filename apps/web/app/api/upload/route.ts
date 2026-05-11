import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    var token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.sub) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    var formData = await request.formData();
    var file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    var imageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    var videoTypes = ["video/mp4", "video/webm", "video/quicktime"];
    var docTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];

    var isImage = imageTypes.includes(file.type);
    var isVideo = videoTypes.includes(file.type);
    var isDoc = docTypes.includes(file.type);

    if (!isImage && !isVideo && !isDoc) {
      return NextResponse.json({ error: "File type not allowed: " + file.type }, { status: 400 });
    }

    var maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    var bytes = await file.arrayBuffer();
    var buffer = Buffer.from(bytes);
    var cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    var uniqueName = Date.now() + "-" + cleanName;
    var uploadDir = path.join(process.cwd(), "public", "uploads");

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, uniqueName), buffer);

    var fileUrl = "/uploads/" + uniqueName;
    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload" }, { status: 500 });
  }
}