import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import PointerLayout from "@/components/PointerLayout";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Terminal",
  description: "An advanced AI chat interface for web content analysis",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PointerLayout>{children}</PointerLayout>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
