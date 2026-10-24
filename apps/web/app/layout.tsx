import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
// REMOVE THIS: import TopHeader from "@/components/TopHeader";

export const metadata: Metadata = {
    title: "WellConnect — Your Digital Wellbeing",
    description: "AI-powered wellbeing intelligence. Check in, reflect, grow.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body style={{ margin: 0, backgroundColor: "#0f0f0f" }}>
                {/* REMOVE THIS: <TopHeader /> */}
                <div style={{ paddingBottom: 72 }}>{children}</div>
                <BottomNav />
            </body>
        </html>
    );
}