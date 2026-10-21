import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken"; // Make sure you import your JWT library here

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    var body = await request.json();
    var { email, code } = body;

    if (!email || !code) {
        return NextResponse.json({ error: "Email and code required" }, { status: 400 });
    }

    var user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.verifyToken !== code) {
        return NextResponse.json({ error: "Invalid code" }, { status: 400 });
    }

    if (!user.verifyTokenExpiry || user.verifyTokenExpiry < new Date()) {
        return NextResponse.json({ error: "Code expired" }, { status: 400 });
    }

    // 1. Mark as verified
    var updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerified: true,
            verifyToken: null,
            verifyTokenExpiry: null,
        },
    });

    // 2. Generate the JWT token (Use the exact same logic as your login route!)
    var token = jwt.sign(
        { userId: updatedUser.id },
        process.env.JWT_SECRET as string,
        { expiresIn: "30d" }
    );

    // 3. Return the token and user!
    return NextResponse.json({
        success: true,
        message: "Email verified successfully",
        token: token,
        user: {
            id: updatedUser.id,
            name: updatedUser.name,
            username: updatedUser.username,
            email: updatedUser.email
        }
    });
}