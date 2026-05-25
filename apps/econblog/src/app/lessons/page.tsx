import type { Metadata } from "next";
import { Suspense } from "react";
import { LessonsCatalogSection } from "@/components/lessons/LessonsCatalogSection";
import { LessonsCatalogSkeleton } from "@/components/lessons/LessonsCatalogSkeleton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Economics Lessons",
  description:
    "Browse interactive economics lessons covering microeconomics, macroeconomics, trade, and finance. Learn through quizzes and mastery exams.",
  alternates: {
    canonical: "/lessons",
  },
  openGraph: {
    title: "Economics Lessons",
    description:
      "Browse interactive economics lessons covering microeconomics, macroeconomics, trade, and finance.",
    url: "/lessons",
    type: "website",
  },
};

export default function LessonsPage() {
  return (
    <Suspense fallback={<LessonsCatalogSkeleton />}>
      <LessonsCatalogSection />
    </Suspense>
  );
}
