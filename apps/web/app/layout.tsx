import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
    title: "WellConnect — Your Digital Wellbeing",
    description: "AI-powered wellbeing intelligence. Check in, reflect, grow.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body style={{ margin: 0 }}>
                <div style={{ paddingBottom: 72 }}>{children}</div>
                <BottomNav />
            </body>
        </html>
    );
}