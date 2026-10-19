"use client";

import { useState } from "react";
import { ResultList } from "@/components/ResultList";
import type { AnswerDetail, PublicQuestion } from "@/lib/questions";

type Stage = "intro" | "quiz" | "submitting" | "done";

type Outcome = { id: string; score: number; total: number; details: AnswerDetail[] };

function verdict(score: number, total: number) {
  const p = score / total;
  if (p === 1) return "Блестяще! Вы настоящий знаток эпохи Возрождения.";
  if (p >= 0.8) return "Отличный результат!";
  if (p >= 0.6) return "Хороший результат, но есть что повторить.";
  if (p >= 0.4) return "Неплохо, но стоит освежить знания.";
  return "Рекомендуем повторить материал по эпохе Возрождения.";
}

export function Quiz({ questions }: { questions: PublicQuestion[] }) {
  const total = questions.length;
  const [stage, setStage] = useState<Stage>("intro");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nameError, setNameError] = useState("");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(total).fill(null));
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const link =
    outcome && typeof window !== "undefined" ? `${window.location.origin}/result/${outcome.id}` : "";

  function start(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setNameError("Пожалуйста, заполните имя и фамилию");
      return;
    }
    setNameError("");
    setStage("quiz");
  }

  function select(i: number) {
    setAnswers((prev) => prev.map((a, idx) => (idx === current ? i : a)));
  }

  async function finish() {
    setStage("submitting");
    setError("");
    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ошибка отправки");
      setOutcome(data);
      setStage("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить результат");
      setStage("quiz");
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  function restart() {
    setStage("intro");
    setCurrent(0);
    setAnswers(Array(total).fill(null));
    setOutcome(null);
    setError("");
  }

  const card = "rounded-3xl bg-white p-6 shadow-[0_24px_60px_rgba(16,24,40,0.12)] sm:p-10";

  if (stage === "intro") {
    return (
      <section className={card}>
        <p className="text-sm font-medium uppercase tracking-widest text-amber-700">Онлайн-тест</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
          История эпохи Возрождения
        </h1>
        <p className="mt-4 text-slate-600">
          {total} вопросов с одним правильным ответом. В конце вы увидите результат, разбор ответов и
          получите уникальную ссылку для преподавателя.
        </p>
        <form onSubmit={start} className="mt-8 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-slate-700">
              Имя
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                maxLength={60}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
                placeholder="Иван"
                autoComplete="given-name"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Фамилия
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                maxLength={60}
                className="mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-200"
                placeholder="Петров"
                autoComplete="family-name"
              />
            </label>
          </div>
          {nameError && <p className="text-sm text-rose-600">{nameError}</p>}
          <button
            type="submit"
            className="w-full rounded-xl bg-amber-700 px-6 py-3 font-semibold text-white transition hover:bg-amber-800 sm:w-auto"
          >
            Начать тест
          </button>
        </form>
      </section>
    );
  }

  if (stage === "done" && outcome) {
    return (
      <div className="space-y-6">
        <section className={card}>
          <p className="text-sm text-slate-500">
            {firstName.trim()} {lastName.trim()}
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-950">Тест завершён</h1>
          <div className="mt-6 flex items-center gap-6">
            <div className="grid h-28 w-28 shrink-0 place-items-center rounded-full border-8 border-amber-600 text-center">
              <span className="text-3xl font-bold text-slate-900">
                {outcome.score}
                <span className="text-lg text-slate-500">/{outcome.total}</span>
              </span>
            </div>
            <div>
              <p className="text-lg font-medium text-slate-900">
                Правильных ответов: {outcome.score} из {outcome.total}
              </p>
              <p className="mt-1 text-slate-600">{verdict(outcome.score, outcome.total)}</p>
              <p className="mt-2 text-sm">
                <span className="font-semibold text-emerald-700">Верно: {outcome.score}</span>
                {" · "}
                <span className="font-semibold text-rose-700">
                  Неверно: {outcome.total - outcome.score}
                </span>
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="font-semibold text-slate-900">Ссылка для преподавателя</h2>
            <p className="mt-1 text-sm text-slate-600">
              Отправьте эту уникальную ссылку преподавателю — по ней он увидит ваше имя, результат и
              ответы.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                readOnly
                value={link}
                onFocus={(e) => e.target.select()}
                className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-800"
              />
              <button
                onClick={copy}
                className="rounded-xl bg-amber-700 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-800"
              >
                {copied ? "Скопировано ✓" : "Копировать"}
              </button>
              <a
                href={link}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-amber-700 px-5 py-2 text-center text-sm font-semibold text-amber-800 hover:bg-amber-100"
              >
                Открыть
              </a>
            </div>
          </div>
        </section>

        <section className={card}>
          <h2 className="mb-5 text-xl font-semibold text-slate-950">Разбор ответов</h2>
          <ResultList questions={questions} details={outcome.details} />
          <button
            onClick={restart}
            className="mt-6 rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Пройти заново
          </button>
        </section>
      </div>
    );
  }

  const q = questions[current];
  const isLast = current === total - 1;
  const busy = stage === "submitting";
  const answeredCount = answers.filter((a) => a !== null).length;

  return (
    <section className={card}>
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>
          Вопрос {current + 1} из {total}
        </span>
        <span>Отвечено: {answeredCount}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-amber-600 transition-all"
          style={{ width: `${((current + 1) / total) * 100}%` }}
        />
      </div>

      <h2 className="mt-6 text-xl font-semibold leading-snug text-slate-950 sm:text-2xl">{q.text}</h2>

      <div className="mt-6 space-y-3">
        {q.options.map((opt, i) => {
          const active = answers[current] === i;
          return (
            <button
              key={i}
              onClick={() => select(i)}
              disabled={busy}
              className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition ${
                active
                  ? "border-amber-600 bg-amber-50 text-slate-900"
                  : "border-slate-200 hover:border-amber-400 hover:bg-slate-50"
              }`}
            >
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border text-sm font-semibold ${
                  active ? "border-amber-600 bg-amber-600 text-white" : "border-slate-300 text-slate-500"
                }`}
              >
                {String.fromCharCode(1040 + i)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>

      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}

      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => setCurrent((c) => c - 1)}
          disabled={current === 0 || busy}
          className="rounded-xl border border-slate-300 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          ← Назад
        </button>
        {isLast ? (
          <button
            onClick={finish}
            disabled={busy || answers[current] === null}
            className="rounded-xl bg-emerald-600 px-6 py-2.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-40"
          >
            {busy ? "Отправка…" : "Завершить тест"}
          </button>
        ) : (
          <button
            onClick={() => setCurrent((c) => c + 1)}
            disabled={answers[current] === null}
            className="rounded-xl bg-amber-700 px-6 py-2.5 font-semibold text-white hover:bg-amber-800 disabled:opacity-40"
          >
            Далее →
          </button>
        )}
      </div>
    </section>
  );
}
