import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "WellConnect — Find Your People",
    template: "%s | WellConnect",
  },
  description: "A social wellness community where engagement unlocks personalized mental health support — without feeling clinical.",
  keywords: ["wellness", "mental health", "community", "support", "therapy", "mindfulness"],
  openGraph: {
    title: "WellConnect — Find Your People",
    description: "A social wellness community where engagement unlocks personalized mental health support.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider>
          <div className="min-h-screen bg-[#f8faf9] dark:bg-gray-950">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}