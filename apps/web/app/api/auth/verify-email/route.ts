import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    await prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerified: true,
            verifyToken: null,
            verifyTokenExpiry: null,
        },
    });

    return NextResponse.json({ success: true, message: "Email verified successfully" });
}