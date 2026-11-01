import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/get-user";
import PDFDocument from "pdfkit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        var userId = await getCurrentUserId(request);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, username: true, createdAt: true }
        });

        const journals = await prisma.journalEntry.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 50
        });

        const moods = await prisma.moodEntry.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 50
        });

        const doc = new PDFDocument({ margin: 50 });

        // ✅ FIXED: Added type Buffer[] and proper chunk typing
        const chunks: Buffer[] = [];
        doc.on("data", (chunk: Buffer) => chunks.push(chunk));

        const pdfPromise = new Promise<Buffer>((resolve) => {
            doc.on("end", () => resolve(Buffer.concat(chunks)));
        });

        // --- DRAW THE PDF ---
        doc.fontSize(24).fillColor("#10b981").text("WellConnect", { align: "center" });
        doc.fontSize(14).fillColor("#666666").text("Personal Data Report", { align: "center" });
        doc.moveDown(2);

        doc.fontSize(16).fillColor("#000000").text("Account Information");
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor("#333333");
        doc.text(`Name: ${user?.name || "N/A"}`);
        doc.text(`Username: @${user?.username || "N/A"}`);
        doc.text(`Member Since: ${user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}`);
        doc.text(`Report Generated: ${new Date().toLocaleDateString()}`);
        doc.moveDown(2);

        doc.fontSize(16).fillColor("#000000").text("Recent Mood Check-ins");
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor("#333333");
        if (moods.length === 0) {
            doc.text("No mood entries recorded.");
        } else {
            moods.forEach((mood) => {
                const date = new Date(mood.createdAt).toLocaleDateString();
                doc.text(`• ${date}: ${mood.label} (Score: ${mood.score}) ${mood.note ? `- "${mood.note}"` : ""}`);
            });
        }
        doc.moveDown(2);

        doc.fontSize(16).fillColor("#000000").text("Recent Journal Entries");
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor("#333333");
        if (journals.length === 0) {
            doc.text("No journal entries recorded.");
        } else {
            journals.forEach((entry) => {
                const date = new Date(entry.createdAt).toLocaleDateString();
                doc.font("Helvetica-Bold").text(`${date} (Sentiment: ${entry.sentiment || "Neutral"})`);
                doc.font("Helvetica").text(entry.content);
                doc.moveDown(1);
            });
        }

        doc.fontSize(10).fillColor("#999999").text("Generated securely by WellConnect.", 50, doc.page.height - 50, { align: "center" });

        doc.end();

        const pdfBuffer = await pdfPromise;

        return new NextResponse(pdfBuffer as any, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="wellconnect-report-${user?.username || "export"}.pdf"`,
            },
        });

    } catch (error: any) {
        console.error("PDF export error:", error);
        return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
    }
}