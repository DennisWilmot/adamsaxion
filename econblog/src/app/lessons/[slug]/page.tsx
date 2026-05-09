import { notFound } from "next/navigation";
import { loadLesson } from "@/lib/lesson-loader";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function LessonPage({ params }: Props) {
  const { slug } = await params;
  const lesson = await loadLesson(slug);

  if (!lesson) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  return <LessonPlayer lesson={lesson} isAuthenticated={isAuthenticated} />;
}
