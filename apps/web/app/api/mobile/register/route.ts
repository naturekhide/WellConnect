import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { signMobileToken } from "@/lib/mobile-auth";

var prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        var body = await request.json();
        var { name, username, email, password } = body;

        if (!name || !username || !email || !password) {
            return NextResponse.json({ error: "All fields required" }, { status: 400 });
        }

        if (username.length < 3) {
            return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
        }

        var existingEmail = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (existingEmail) {
            return NextResponse.json({ error: "Email already registered" }, { status: 400 });
        }

        var existingUsername = await prisma.user.findUnique({
            where: { username: username.trim() },
        });
        if (existingUsername) {
            return NextResponse.json({ error: "Username already taken" }, { status: 400 });
        }

        var hashedPassword = await bcrypt.hash(password, 10);

        var user = await prisma.user.create({
            data: {
                name: name.trim(),
                username: username.trim(),
                email: email.toLowerCase(),
                password: hashedPassword,
            },
        });

        var token = signMobileToken(user.id);

        return NextResponse.json({
            token: token,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
            },
        }, { status: 201 });
    } catch (e) {
        console.error("Mobile register error:", e);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}