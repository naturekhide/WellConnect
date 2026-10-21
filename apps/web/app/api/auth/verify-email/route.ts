import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    try {
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

        var updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verifyToken: null,
                verifyTokenExpiry: null,
            },
        });

        // Generate token EXACTLY like the mobile login route does
        var token = jwt.sign(
            { id: updatedUser.id, email: updatedUser.email },
            process.env.NEXTAUTH_SECRET || "wellconnect-secret-key-2026",
            { expiresIn: "30d" }
        );

        return NextResponse.json({
            success: true,
            token: token, // <--- NOW returning the token
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                username: updatedUser.username,
                email: updatedUser.email,
            }
        });
    } catch (error: any) {
        console.error("VERIFY ERROR:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}