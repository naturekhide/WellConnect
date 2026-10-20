import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs"; // Ensure you have bcryptjs installed in apps/web

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    var body = await request.json();
    var { email, code, newPassword } = body;

    if (!email || !code || !newPassword) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (newPassword.length < 8) {
        return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    var user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.resetToken !== code) {
        return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
        return NextResponse.json({ error: "Code has expired" }, { status: 400 });
    }

    var hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null,
        },
    });

    return NextResponse.json({ success: true, message: "Password updated." });
}