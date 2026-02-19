import type { Metadata } from "next";
import { Noto_Serif_KR } from "next/font/google";
import "./globals.css";

const notoSerifKr = Noto_Serif_KR({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["200", "400", "700", "900"], // Use a range of weights for implementation flexibility
});

export const metadata: Metadata = {
  title: "ShowMeTheFuture | 당신의 운명을 마주하세요",
  description: "전통 명리학 기반의 정확하고 깊이 있는 사주 풀이 서비스",
  metadataBase: new URL("https://showmethefuture.vercel.app"),
  openGraph: {
    title: "ShowMeTheFuture",
    description: "당신의 사주팔자, 대운, 12신살을 현대적인 디자인으로 분석해 드립니다.",
    url: "https://showmethefuture.vercel.app",
    siteName: "ShowMeTheFuture",
    locale: "ko_KR",
    type: "website",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSerifKr.variable} font-serif`}>
        {children}
      </body>
    </html>
  );
}
