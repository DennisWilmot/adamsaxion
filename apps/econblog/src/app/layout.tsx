import type { Metadata } from "next";
import { Suspense } from "react";
import { Source_Serif_4, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthNotice } from "@/components/AuthNotice";
import { Header } from "@/components/Header";
import { HeaderShell } from "@/components/HeaderShell";
import { getAppUrl } from "@/lib/stripe/config";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "600", "700", "900"],
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
  title: {
    default: "Adam's Axioms — Economics Learning Platform",
    template: "%s | Adam's Axioms",
  },
  description:
    "Learn economics through interactive lessons, quizzes, and mastery exams. Free intro lesson plus a full curriculum in micro, macro, trade, and finance.",
  openGraph: {
    type: "website",
    siteName: "Adam's Axioms",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sourceSerif.variable} ${hankenGrotesk.variable}`}>
      <body className="font-body bg-surface text-foreground min-h-screen antialiased">
        <Suspense fallback={<HeaderShell />}>
          <Header />
        </Suspense>
        <Suspense fallback={null}>
          <AuthNotice />
        </Suspense>
        <main>{children}</main>
      </body>
    </html>
  );
} 