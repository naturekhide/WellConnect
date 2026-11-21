import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const { identifier } = await request.json();

        if (!identifier) {
            return NextResponse.json({ suspended: false });
        }

        // Find the user by email or username
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { username: identifier }
                ]
            },
            select: { suspended: true }
        });

        if (user && user.suspended) {
            return NextResponse.json({ suspended: true });
        }

        return NextResponse.json({ suspended: false });
    } catch (error) {
        return NextResponse.json({ suspended: false });
    }
}