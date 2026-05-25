export interface QuizQuestion {
  id: string;
  type: "intuition" | "in-lesson" | "recap";
  question: string;
  options: string[];
  correctAnswer: number | null;
  difficulty: "easy" | "medium" | "hard";
  xpReward: number;
  xpPenalties: [number, number];
  explanation: string;
}

export interface Subsection {
  id: string;
  title: string;
  content: string;
  quiz?: QuizQuestion;
}

export interface Section {
  id: string;
  title: string;
  subsections: Subsection[];
}

export interface MasteryQuestion extends QuizQuestion {
  // Inherits all QuizQuestion fields; xpReward defaults to 30 for mastery
}

export interface MasteryQuiz {
  questionsPerAttempt: number;
  passingScore: number;
  timeLimitMinutes: number;
  questionPool: MasteryQuestion[];
  generationProgress?: {
    generatedCount: number;
    targetCount: number;
    complete: boolean;
    lastUpdatedAt?: string;
  };
}

export interface LessonData {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  estimatedMinutes: number;
  description: string;
  thumbnail: string;
  sections: Section[];
  masteryQuiz: MasteryQuiz;
}

export interface LessonMeta {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  estimatedMinutes: number;
  description: string;
  thumbnail: string;
  totalXp: number;
  sectionCount: number;
  subsectionCount: number;
}

export function calculateLessonXp(lesson: LessonData): number {
  let total = 0;
  for (const section of lesson.sections) {
    for (const sub of section.subsections) {
      if (sub.quiz) total += sub.quiz.xpReward;
    }
  }
  const firstMasteryQuestion = lesson.masteryQuiz.questionPool[0];
  const masteryXpPerQuestion = firstMasteryQuestion
    ? firstMasteryQuestion.xpReward
    : 30;
  total += masteryXpPerQuestion * lesson.masteryQuiz.questionsPerAttempt;
  return total;
}
