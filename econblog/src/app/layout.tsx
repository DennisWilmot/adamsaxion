import type { Metadata } from "next";
import { Source_Serif_4, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";

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
  title: "Adam's Axioms - Economics Learning Platform",
  description:
    "Learn economics through interactive lessons and gamified learning",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sourceSerif.variable} ${hankenGrotesk.variable}`}>
      <body className="font-body bg-surface text-foreground min-h-screen antialiased">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
} 