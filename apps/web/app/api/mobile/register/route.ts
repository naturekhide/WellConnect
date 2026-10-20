import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    var body = await request.json();
    var { name, username, email, password } = body;

    if (!name || !username || !email || !password) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    var existing = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
    });

    if (existing) {
        return NextResponse.json({ error: "Email or username already taken" }, { status: 400 });
    }

    var hashedPassword = await bcrypt.hash(password, 10);

    var verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    var verifyExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    var user = await prisma.user.create({
        data: {
            name,
            username,
            email,
            password: hashedPassword,
            emailVerified: false,
            verifyToken: verifyCode,
            verifyTokenExpiry: verifyExpiry,
        },
    });

    await sendVerificationEmail(email, verifyCode);

    // Return success, but NO token. User must verify first.
    return NextResponse.json({ success: true, message: "Verification code sent", userId: user.id }, { status: 201 });
}