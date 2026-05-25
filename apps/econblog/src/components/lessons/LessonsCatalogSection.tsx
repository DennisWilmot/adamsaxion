import Link from "next/link";
import { loadAllLessonMeta } from "@/lib/lesson-loader";
import { LessonsCatalog } from "@/components/lessons/LessonsCatalog";

export async function LessonsCatalogSection() {
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
