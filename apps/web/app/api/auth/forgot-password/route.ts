import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    var body = await request.json();
    var { email } = body;

    if (!email) {
        return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    var user = await prisma.user.findUnique({ where: { email } });
    
    // Security: Always return success even if email doesn't exist (prevents email harvesting)
    if (!user) {
        return NextResponse.json({ success: true, message: "If an account exists, a code was sent." });
    }

    // Generate 6-digit code
    var code = Math.floor(100000 + Math.random() * 900000).toString();
    var expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    await prisma.user.update({
        where: { id: user.id },
        data: {
            resetToken: code,
            resetTokenExpiry: expiry,
        },
    });

    await sendPasswordResetEmail(email, code);

    return NextResponse.json({ success: true, message: "Code sent." });
}