import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

var prisma = new PrismaClient();

export async function POST(request: NextRequest) {
    try {
        var body = await request.json();
        var { name, username, email, password } = body;

        if (!name || name.trim().length === 0) {
            return NextResponse.json({ error: "Full name is required" }, { status: 400 });
        }

        if (!username || username.trim().length < 3) {
            return NextResponse.json({ error: "Username must be at least 3 characters" }, { status: 400 });
        }

        if (!email || !email.includes("@")) {
            return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
        }

        if (!password || password.length < 8) {
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

        return NextResponse.json(
            {
                message: "Account created successfully",
                user: { id: user.id, name: user.name, username: user.username, email: user.email },
            },
            { status: 201 }
        );
    } catch (e) {
        console.error("Registration error:", e);
        return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
}