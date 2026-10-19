import { randomBytes } from "node:crypto";
import { db } from "@/db";
import { quizResults } from "@/db/schema";
import { QUESTIONS, TOTAL, evaluate } from "@/lib/questions";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const { firstName, lastName, answers } = (body ?? {}) as {
    firstName?: unknown;
    lastName?: unknown;
    answers?: unknown;
  };

  const first = typeof firstName === "string" ? firstName.trim().slice(0, 60) : "";
  const last = typeof lastName === "string" ? lastName.trim().slice(0, 60) : "";

  if (!first || !last) {
    return Response.json({ error: "Укажите имя и фамилию" }, { status: 400 });
  }
  if (!Array.isArray(answers) || answers.length !== TOTAL) {
    return Response.json({ error: "Некорректные ответы" }, { status: 400 });
  }

  const cleaned: (number | null)[] = answers.map((a, i) =>
    typeof a === "number" && Number.isInteger(a) && a >= 0 && a < QUESTIONS[i].options.length
      ? a
      : null,
  );

  const { score, details } = evaluate(cleaned);
  const id = randomBytes(9).toString("base64url");

  await db.insert(quizResults).values({
    id,
    firstName: first,
    lastName: last,
    score,
    total: TOTAL,
    answers: cleaned,
  });

  return Response.json({ id, score, total: TOTAL, details });
}
