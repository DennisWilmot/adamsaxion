import Link from "next/link";
import { loadAllLessonMeta } from "@/lib/lesson-loader";
import { getUserDashboard } from "@/lib/learning/user-dashboard";
import { createClient } from "@/lib/supabase/server";
import { getUserSubscriptionView } from "@/lib/subscription/service";
import { LessonsCatalog } from "@/components/lessons/LessonsCatalog";

export async function LessonsCatalogSection() {
  const lessons = await loadAllLessonMeta();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [initialDashboard, subscription] = user
    ? await Promise.all([
        getUserDashboard(user.id),
        getUserSubscriptionView(user.id, user.email),
      ])
    : [null, null];

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
      <LessonsCatalog
        lessons={lessons}
        initialDashboard={initialDashboard}
        initialHasAccess={user ? (subscription?.hasAccess ?? false) : null}
      />
    </>
  );
}
