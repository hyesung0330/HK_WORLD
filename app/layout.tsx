import type { Metadata } from "next";
import "./globals.css";
import {DarkMoodControler} from "@/app/context/darkmood";
import Providers from "@/components/providers";
import localFont from 'next/font/local';

const A2ZFONT = localFont({
    src: [
        { path: '../public/font/local/에이투지체-1Thin.woff2', weight: '100', style: 'normal' },
        { path: '../public/font/local/에이투지체-2ExtraLight.woff2', weight: '200', style: 'normal' },
        { path: '../public/font/local/에이투지체-3Light.woff2', weight: '300', style: 'normal' },
        { path: '../public/font/local/에이투지체-4Regular.woff2', weight: '400', style: 'normal' },
        { path: '../public/font/local/에이투지체-5Medium.woff2', weight: '500', style: 'normal' },
        { path: '../public/font/local/에이투지체-6SemiBold.woff2', weight: '600', style: 'normal' },
        { path: '../public/font/local/에이투지체-7Bold.woff2', weight: '700', style: 'normal' },
        { path: '../public/font/local/에이투지체-8ExtraBold.woff2', weight: '800', style: 'normal' },
        { path: '../public/font/local/에이투지체-9Black.woff2', weight: '900', style: 'normal' },
    ],
    variable: '--font-a2z',
});

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });
//
// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Textra",
  description: "블로그형 포럼 사이트입니다",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
          className={`${A2ZFONT.variable} ${A2ZFONT.className} antialiased`}
      >
      <Providers>
          <DarkMoodControler>
              {children}
          </DarkMoodControler>
      </Providers>
      </body>
    </html>
  );
}
