import type { Metadata } from "next";
import { LandingPage } from "@/components/landing/LandingPage";
import { loadAllLessonMeta } from "@/lib/lesson-loader";

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

export default async function HomePage() {
  const carouselLessons = (await loadAllLessonMeta()).slice(0, 12);

  return <LandingPage carouselLessons={carouselLessons} />;
}
