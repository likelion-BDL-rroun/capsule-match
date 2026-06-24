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
  title: "character-pick-2026univ",
  description: "80개 대학, 80종 캐릭터. 우리 학교의 캐릭터를 직접 뽑아보세요.",
  openGraph: {
    title: "캐릭터 카드 뽑기 | LIKELION",
    description: "80개 대학, 80종 캐릭터. 우리 학교의 캐릭터를 직접 뽑아보세요.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "캐릭터 카드 뽑기 | LIKELION",
    description: "80개 대학, 80종 캐릭터. 우리 학교의 캐릭터를 직접 뽑아보세요.",
  },
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
        <link rel="preload" as="image" href="/검표원_더미이미지0624.webp" />
        <link rel="preload" as="image" href="/card-back-0624.png" />
        <link rel="preload" as="video" href="/검표원 사자 배경보정.mp4" type="video/mp4" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
