import { SectionShell } from "@/components/marketing/section-shell";

const faqs = [
  {
    question: "Это юридическое заключение?",
    answer:
      "Нет. PDn Control выполняет технический и контентный анализ сайта. Финальные юридические выводы должен подтверждать специалист.",
  },
  {
    question: "Что проверяет сервис?",
    answer:
      "Формы сбора данных, политику конфиденциальности, согласия, SSL, технические признаки сайта и найденные страницы.",
  },
  {
    question: "Можно проверить сайт без регистрации?",
    answer:
      "Да, можно запустить ограниченное число гостевых проверок. Доступный лимит показывается рядом с формой.",
  },
  {
    question: "Что я получу после проверки?",
    answer:
      "Структурированный отчет с найденными рисками, evidence, статусами проверок, risk score и PDF.",
  },
  {
    question: "Сервис меняет мой сайт?",
    answer:
      "Нет. Проверка анализирует публично доступные страницы и не вносит изменения.",
  },
];

export function FAQSection() {
  return (
    <SectionShell id="faq">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-medium text-primary">FAQ</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Коротко о проверке
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Ответы на вопросы, которые обычно возникают перед первой проверкой сайта.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-white/10 bg-white/[0.035] p-5"
            >
              <summary className="cursor-pointer list-none text-base font-semibold marker:hidden">
                <span className="flex items-center justify-between gap-4">
                  {faq.question}
                  <span className="text-xl font-light text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
