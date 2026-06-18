import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "캐릭터 캡슐 뽑기 | LIKELION",
  description: "80개 대학, 80종 캐릭터. 우리 학교의 캐릭터를 직접 뽑아보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preload" as="image" href="/더미이미지_용량 조절.webp" />
        <link rel="preload" as="video" href="/검표원 사자 배경보정.mp4" type="video/mp4" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
