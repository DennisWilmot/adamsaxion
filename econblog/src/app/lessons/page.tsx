import type { Metadata } from "next";
import Link from "next/link";
import { LessonsCatalog } from "@/components/lessons/LessonsCatalog";
import { loadAllLessonMeta } from "@/lib/lesson-loader";

export const revalidate = 3600;

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

export default async function LessonsPage() {
  const lessons = await loadAllLessonMeta();

  return (
    <>
      <nav aria-label="All economics lessons" className="sr-only">
        <ul>
          {lessons.map((lesson) => (
            <li key={lesson.id}>
              <Link href={`/lessons/${lesson.id}`}>{lesson.title}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <LessonsCatalog lessons={lessons} />
    </>
  );
}
