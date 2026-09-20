import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "WellConnect — Your Digital Wellbeing",
    description: "AI-powered wellbeing intelligence. Check in, reflect, grow.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}