import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { getCurrentUserId } from "@/lib/get-user";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

var ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
var MAX_SIZE = 5 * 1024 * 1024; // 5 MB per file
var MAX_FILES = 4;

export async function POST(request: NextRequest) {
    var userId = await getCurrentUserId(request);
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        var formData = await request.formData();
        var files = formData.getAll("files") as File[];

        if (files.length === 0) {
            return NextResponse.json({ error: "No files provided" }, { status: 400 });
        }

        if (files.length > MAX_FILES) {
            return NextResponse.json({ error: "Maximum " + MAX_FILES + " files allowed" }, { status: 400 });
        }

        var uploadDir = join(process.cwd(), "public", "uploads");
        await mkdir(uploadDir, { recursive: true });

        var urls: string[] = [];

        for (var i = 0; i < files.length; i++) {
            var file = files[i];

            if (!ALLOWED_TYPES.includes(file.type)) {
                return NextResponse.json({ error: "Only images are allowed (JPEG, PNG, GIF, WebP)" }, { status: 400 });
            }

            if (file.size > MAX_SIZE) {
                return NextResponse.json({ error: "Each file must be under 5 MB" }, { status: 400 });
            }

            var bytes = await file.arrayBuffer();
            var buffer = Buffer.from(bytes);

            var ext = file.name.split(".").pop() || "jpg";
            var uniqueName = Date.now() + "-" + crypto.randomBytes(4).toString("hex") + "." + ext;
            var filePath = join(uploadDir, uniqueName);

            await writeFile(filePath, buffer);
            urls.push("/uploads/" + uniqueName);
        }

        return NextResponse.json({ urls }, { status: 201 });
    } catch (e) {
        console.error("Multi upload error:", e);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}