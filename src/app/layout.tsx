import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Тест: История эпохи Возрождения",
  description: "Онлайн-тест из 10 вопросов по истории эпохи Возрождения с результатом для преподавателя.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-stone-100 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
