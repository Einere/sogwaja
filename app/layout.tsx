import type { Metadata, Viewport } from "next";
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
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SsgoiProvider>
          <div className="bg-muted min-h-screen">
            <div className="bg-background mx-auto min-h-screen max-w-md">{children}</div>
          </div>
        </SsgoiProvider>
      </body>
    </html>
  );
}
