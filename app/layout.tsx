import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// 환경변수 있을 때만 로드 (없으면 아무 스크립트도 안 붙음)
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID;

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
      <body className="min-h-full flex flex-col">
        {children}

        {/* Google Analytics 4 — 비동기 로드, 환경변수 있을 때만 */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
            </Script>
          </>
        )}

        {/* Microsoft Clarity — 비동기 로드, 환경변수 있을 때만 */}
        {CLARITY_ID && (
          <Script id="clarity-init" strategy="afterInteractive">
            {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");`}
          </Script>
        )}
      </body>
    </html>
  );
}
