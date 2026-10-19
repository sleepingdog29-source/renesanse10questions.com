import type { Metadata } from "next";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { quizResults } from "@/db/schema";
import { ResultList } from "@/components/ResultList";
import { PUBLIC_QUESTIONS, evaluate } from "@/lib/questions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Результат теста — История эпохи Возрождения",
  robots: { index: false },
};

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [row] = await db.select().from(quizResults).where(eq(quizResults.id, id)).limit(1);

  if (!row) {
    return (
      <main className="mx-auto grid min-h-screen max-w-xl place-items-center px-4">
        <div className="rounded-3xl bg-white p-10 text-center shadow-lg">
          <h1 className="text-2xl font-semibold">Результат не найден</h1>
          <p className="mt-2 text-slate-600">Проверьте правильность ссылки.</p>
          <Link href="/" className="mt-6 inline-block font-semibold text-amber-800 underline">
            К тесту
          </Link>
        </div>
      </main>
    );
  }

  const { details } = evaluate(row.answers);
  const date = new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Moscow",
  }).format(row.createdAt);

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl space-y-6 px-4 py-8 sm:py-12">
      <section className="rounded-3xl bg-white p-6 shadow-[0_24px_60px_rgba(16,24,40,0.12)] sm:p-10">
        <p className="text-sm font-medium uppercase tracking-widest text-amber-700">
          Результат для преподавателя
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">
          {row.firstName} {row.lastName}
        </h1>
        <p className="mt-1 text-slate-600">Тест: «История эпохи Возрождения» · {date} (МСК)</p>
        <div className="mt-6 flex items-center gap-6">
          <div className="grid h-28 w-28 shrink-0 place-items-center rounded-full border-8 border-amber-600">
            <span className="text-3xl font-bold">
              {row.score}
              <span className="text-lg text-slate-500">/{row.total}</span>
            </span>
          </div>
          <div>
            <p className="text-lg font-medium">
              Правильных ответов: {row.score} из {row.total}
            </p>
            <p className="mt-1 text-sm">
              <span className="font-semibold text-emerald-700">Верно: {row.score}</span>
              {" · "}
              <span className="font-semibold text-rose-700">Неверно: {row.total - row.score}</span>
              {" · "}
              <span className="text-slate-600">
                {Math.round((row.score / row.total) * 100)}%
              </span>
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-[0_24px_60px_rgba(16,24,40,0.12)] sm:p-10">
        <h2 className="mb-5 text-xl font-semibold text-slate-950">Ответы ученика</h2>
        <ResultList questions={PUBLIC_QUESTIONS} details={details} />
      </section>
    </main>
  );
}
