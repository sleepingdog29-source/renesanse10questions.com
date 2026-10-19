import { Quiz } from "@/components/Quiz";
import { PUBLIC_QUESTIONS } from "@/lib/questions";

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-4 py-8 sm:py-12">
      <Quiz questions={PUBLIC_QUESTIONS} />
    </main>
  );
}
