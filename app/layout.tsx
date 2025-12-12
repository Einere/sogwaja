import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SsgoiProvider from "@/components/layout/SsgoiProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "구움과자 조리법",
  description: "구움과자 조리법을 관리하는 앱",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased `}>
        <SsgoiProvider>
          <div className="min-h-screen bg-muted">
            <div className="max-w-md mx-auto bg-background min-h-screen">{children}</div>
          </div>
        </SsgoiProvider>
      </body>
    </html>
  );
}
