import type { AnswerDetail, PublicQuestion } from "@/lib/questions";

export function ResultList({
  questions,
  details,
}: {
  questions: PublicQuestion[];
  details: AnswerDetail[];
}) {
  return (
    <ol className="space-y-4">
      {questions.map((q, i) => {
        const d = details[i];
        const isRight = d.selected === d.correct;
        return (
          <li
            key={i}
            className={`rounded-2xl border-2 p-5 ${
              isRight ? "border-emerald-300 bg-emerald-50/60" : "border-rose-300 bg-rose-50/60"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-slate-900">
                {i + 1}. {q.text}
              </h3>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                  isRight ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                }`}
              >
                {isRight ? "Верно" : d.selected === null ? "Нет ответа" : "Неверно"}
              </span>
            </div>
            <ul className="mt-3 space-y-2">
              {q.options.map((opt, j) => {
                const isCorrect = j === d.correct;
                const isWrongPick = j === d.selected && !isCorrect;
                let cls = "border-slate-200 bg-white text-slate-700";
                let mark = "";
                if (isCorrect) {
                  cls = "border-emerald-500 bg-emerald-100 text-emerald-900 font-medium";
                  mark = j === d.selected ? "✓ Выбран, верно" : "✓ Правильный ответ";
                } else if (isWrongPick) {
                  cls = "border-rose-500 bg-rose-100 text-rose-900 font-medium";
                  mark = "✗ Выбран, неверно";
                }
                return (
                  <li
                    key={j}
                    className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-2 text-sm ${cls}`}
                  >
                    <span>{opt}</span>
                    {mark && <span className="shrink-0 text-xs">{mark}</span>}
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-sm text-slate-600">💡 {d.explanation}</p>
          </li>
        );
      })}
    </ol>
  );
}
