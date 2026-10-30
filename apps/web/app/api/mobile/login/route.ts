import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    var body = await request.json();
    var { identifier, password } = body;

    if (!identifier || !password) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    var user = await prisma.user.findFirst({
        where: {
            OR: [{ email: identifier }, { username: identifier }],
        },
    });

    if (!user) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    var valid = await bcrypt.compare(password, user.password);
    if (!valid) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Check Email Verification
    if (!user.emailVerified) {
        // 🚨 Auto-verify accounts older than 3 days
        var accountAge = Date.now() - new Date(user.createdAt).getTime();
        var threeDays = 3 * 24 * 60 * 60 * 1000;

        if (accountAge > threeDays) {
            await prisma.user.update({
                where: { id: user.id },
                data: { emailVerified: true }
            });
        } else {
            return NextResponse.json({ error: "Please verify your email address first." }, { status: 403 });
        }
    }

    var token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.NEXTAUTH_SECRET || "wellconnect-secret-key-2026",
        { expiresIn: "30d" }
    );

    return NextResponse.json({
        token,
        user: {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
        },
    });
}