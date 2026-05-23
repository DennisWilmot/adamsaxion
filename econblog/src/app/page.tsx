import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";

export const metadata: Metadata = {
  title: "Learn Economics Interactively",
  description:
    "Master microeconomics, macroeconomics, trade, and finance through interactive lessons with quizzes and mastery exams. Start free with Lesson Zero.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Learn Economics Interactively",
    description:
      "Master economics through interactive lessons with quizzes and mastery exams. Start free with Lesson Zero.",
    url: "/",
  },
};

export default function HomePage() {
  return <LandingPage />;
}
