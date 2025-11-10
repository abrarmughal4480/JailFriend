import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/video-call.css";
import Head from 'next/head';
import { DarkModeProvider } from '@/contexts/DarkModeContext';
import { PrivacyProvider } from '@/contexts/PrivacyContext';
import { VideoCallProvider } from '@/contexts/VideoCallContext';


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Jaifriend",
    description: "Jaifriend is a social media platform for friends to connect and share their stories.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-gray-50 dark:bg-gray-900 overflow-x-hidden transition-colors duration-200 custom-scrollbar">
        <div className="w-full overflow-x-hidden">
          <DarkModeProvider>
            <PrivacyProvider>
              <VideoCallProvider>
                {children}
              </VideoCallProvider>
            </PrivacyProvider>
          </DarkModeProvider>
        </div>
      </body>
    </html>
  );
}
