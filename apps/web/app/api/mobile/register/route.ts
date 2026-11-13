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

    // 🚨 TEMPORARY: Skip email verification
    var user = await prisma.user.create({
        data: {
            name,
            username,
            email,
            password: hashedPassword,
            emailVerified: true, // 👈 Auto-verify immediately
        },
    });

    // 🚨 TEMPORARY: Skip sending the email
    // var verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    // var verifyExpiry = new Date(Date.now() + 15 * 60 * 1000);
    // await prisma.user.update({
    //     where: { id: user.id },
    //     data: { verifyToken: verifyCode, verifyTokenExpiry: verifyExpiry }
    // });
    // await sendVerificationEmail(email, verifyCode);

    return NextResponse.json({
        success: true,
        message: "Account created successfully",
        userId: user.id
    }, { status: 201 });
}