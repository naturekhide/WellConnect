import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { signMobileToken } from "@/lib/mobile-auth";

var prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        var body = await request.json();
        var { identifier, password } = body;

        if (!identifier || !password) {
            return NextResponse.json({ error: "Identifier and password required" }, { status: 400 });
        }

        var user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier.toLowerCase() },
                    { username: identifier },
                ],
            },
        });

        if (!user || !user.password) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        var valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        var token = signMobileToken(user.id);

        return NextResponse.json({
            token: token,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
            },
        });
    } catch (e) {
        console.error("Mobile login error:", e);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}