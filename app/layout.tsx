import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MOTI - 노션처럼 기록하고, AI와 함께 밀어붙이는 메모",
  description:
    "노션처럼 기록하고, AI 캐릭터와 함께 밀어붙이는 메모 툴",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased min-h-screen bg-moti-bg text-moti-text">
        {children}
      </body>
    </html>
  );
}
