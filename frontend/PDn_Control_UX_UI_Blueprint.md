# PDn Control — UX/UI Blueprint

Версия: 1.0  
Цель: редизайн UI без радикального изменения текущего UX и backend-flow.  
Референс: Resend как ориентир по product-first storytelling, премиальному dark SaaS UI и демонстрации продукта через реальные сценарии, но без копирования визуала, текста, структуры или ассетов.

---

## 1. Контекст продукта

PDn Control — legal-tech / cybersecurity SaaS для проверки сайтов на риски, связанные с обработкой персональных данных и требованиями 152-ФЗ.

Основной пользовательский сценарий:

```text
Пользователь вводит URL сайта
→ система запускает проверку
→ crawler собирает данные
→ backend анализирует юридические и технические признаки
→ пользователь получает отчет с нарушениями, evidence, risk score и PDF
```

Ключевая ценность продукта:

```text
Не просто “проверить сайт”, а быстро получить понятный отчет:
- какие нарушения найдены;
- где они найдены;
- почему это риск;
- какие последствия возможны;
- что исправить в первую очередь.
```

---

## 2. Главная дизайн-задача

Текущий UX в целом нормальный: пользователь понимает, куда вводить URL, проверка запускается, затем открывается progress/result flow.

Проблема — UI выглядит как MVP, а не как зрелый B2B SaaS для заказчиков.

Цель редизайна:

```text
Сделать продукт визуально похожим на премиальный legal-tech / cybersecurity SaaS:
- серьезный;
- аккуратный;
- доказательный;
- технический;
- надежный;
- современный;
- не похожий на учебный прототип.
```

Главная формула нового UI:

```text
Не “сайт с формой проверки”.
А “compliance control room, который за минуту показывает юридические и технические риски сайта”.
```

---

## 3. Что взять от Resend

Resend использовать не как шаблон для копирования, а как источник принципов:

```text
1. Product-first storytelling.
2. Dark-first premium SaaS aesthetic.
3. Минимум лишнего декора.
4. Сильный hero с ясным positioning.
5. Демонстрация продукта прямо на landing page.
6. Короткие и уверенные тексты.
7. Визуальные proof-блоки вместо абстрактных обещаний.
8. Много воздуха, сильная иерархия, аккуратные компоненты.
```

Адаптация под PDn Control:

| Resend-паттерн | Адаптация под PDn Control |
|---|---|
| “Email for developers” | “Проверка сайтов на риски по 152-ФЗ” |
| Код как proof of simplicity | URL form + report preview |
| HTTP/event logs | Этапы проверки: crawler, forms, policy, SSL, report |
| Developer experience | Legal/compliance confidence |
| Product demo | Preview отчета с нарушениями и evidence |
| Physical object | Фото молотка / law background |
| Dashboard preview | Risk score, штрафы, evidence, PDF |

Не копировать:

```text
- точный layout Resend;
- кубик/3D-объекты Resend;
- их тексты;
- их цветовую систему;
- их типографику;
- их композицию pixel-perfect.
```

---

## 4. Визуальная концепция

Название концепции:

```text
Legal Cyber Control Room
```

Ключевые ассоциации:

```text
dark
precise
legal
controlled
evidence-based
premium
calm
technical
trustworthy
```

Визуальное ощущение:

```text
Сервис должен выглядеть как серьезный инструмент для compliance-аудита:
- не playful;
- не “госуслуги”;
- не generic AI startup;
- не neon cyberpunk;
- не юридическая газета;
- не шаблонный bootstrap-dashboard.
```

Должно ощущаться:

```text
закон + кибербезопасность + контроль + доказательная база
```

---

## 5. Фоновое фото с молотком

Можно использовать hero-background с молотком/законодательной темой.

Рекомендуемая композиция:

```text
Desktop:
[слева: текст + URL form + trust chips] [справа: gavel photo + floating report card]

Mobile:
[темный фон + легкий фрагмент фото] [текст] [форма] [мини-превью отчета]
```

Правила использования фото:

```text
- Фото не должно мешать тексту.
- Текстовая зона слева должна быть почти полностью темной.
- Справа можно оставить атмосферный молоток.
- Обязательно добавить сильный overlay.
- Фото не должно быть главным объектом — главным объектом остается продукт.
- Если фото перевернуто, проверить, чтобы молоток не “давил” на текст.
```

Пример CSS-направления:

```css
.hero {
  background:
    linear-gradient(
      90deg,
      rgba(5, 6, 10, 0.98) 0%,
      rgba(5, 6, 10, 0.84) 42%,
      rgba(5, 6, 10, 0.35) 100%
    ),
    url("/images/gavel-bg.jpg");
  background-size: cover;
  background-position: center right;
}
```

Дополнительный overlay:

```css
.hero::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 70% 30%, rgba(120, 95, 40, 0.18), transparent 36%),
    linear-gradient(to bottom, rgba(5, 6, 10, 0.1), rgba(5, 6, 10, 0.9));
  pointer-events: none;
}
```

---

## 6. Цветовая система

Базовая палитра:

```text
Background base: почти черный, но не #000
Surface: графитовый
Elevated surface: чуть светлее
Border: белый 8–12% opacity
Text primary: warm white
Text secondary: холодный серый
Accent: синий/индиго для tech
Legal accent: muted gold/amber для юридической темы
Danger: red
Warning: amber
Success: emerald
```

Рекомендуемые токены:

```css
:root {
  --radius: 16px;

  --background: oklch(0.055 0.012 260);
  --foreground: oklch(0.94 0.01 260);

  --card: oklch(0.095 0.014 260);
  --card-foreground: oklch(0.94 0.01 260);

  --popover: oklch(0.095 0.014 260);
  --popover-foreground: oklch(0.94 0.01 260);

  --primary: oklch(0.66 0.16 255);
  --primary-foreground: oklch(0.98 0.004 260);

  --secondary: oklch(0.16 0.016 260);
  --secondary-foreground: oklch(0.88 0.01 260);

  --muted: oklch(0.16 0.016 260);
  --muted-foreground: oklch(0.68 0.02 260);

  --accent: oklch(0.17 0.022 260);
  --accent-foreground: oklch(0.92 0.01 260);

  --destructive: oklch(0.62 0.22 25);

  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 14%);
  --ring: oklch(0.66 0.16 255);

  --chart-1: oklch(0.66 0.16 255);
  --chart-2: oklch(0.72 0.12 78);
  --chart-3: oklch(0.7 0.15 150);
  --chart-4: oklch(0.72 0.16 65);
  --chart-5: oklch(0.65 0.18 25);
}
```

Юридический gold/amber использовать ограниченно:

```text
Можно:
- small badge;
- thin accent line;
- icon background;
- section eyebrow.

Нельзя:
- делать все кнопки золотыми;
- заливать большие блоки золотым;
- превращать сайт в “адвокатскую контору”.
```

---

## 7. Типографика

Текущая Geist-база подходит.

Рекомендуемая система:

```text
Headings: Geist
Body: Geist
Data / URL / IP / evidence: mono font
```

Размеры:

```text
Hero h1:
- desktop: 56–72px
- mobile: 36–44px

Section h2:
- desktop: 36–48px
- mobile: 28–34px

Body:
- 16–18px

Small UI:
- 12–14px

Data / mono:
- 12–14px
```

Правила:

```text
- h1 должен быть очень сильным и коротким.
- Не использовать слишком много font-weight.
- Для UI достаточно 400 / 500 / 600 / 700.
- URL, IP, evidence, report ID показывать mono-шрифтом.
- Не делать весь сайт одинаковым размером текста.
```

---

## 8. Компонентная система

### Base card

```text
rounded-2xl
border border-white/10
bg-white/[0.035]
shadow-[0_24px_80px_rgba(0,0,0,0.35)]
backdrop-blur-xl
```

### Elevated card

```text
rounded-2xl
border border-white/12
bg-gradient-to-b from-white/[0.08] to-white/[0.025]
shadow-[0_24px_80px_rgba(0,0,0,0.35)]
```

### Status cards

```text
Violation:
border-red-500/20
bg-red-500/[0.06]
text-red-300

Warning:
border-amber-500/20
bg-amber-500/[0.06]
text-amber-300

Passed:
border-emerald-500/20
bg-emerald-500/[0.06]
text-emerald-300
```

### Buttons

Primary:

```text
bg-primary
text-primary-foreground
rounded-xl
h-11 / h-12
subtle hover brightness
visible focus ring
```

Secondary:

```text
border-white/10
bg-white/[0.04]
hover:bg-white/[0.08]
```

Ghost:

```text
text-muted-foreground
hover:text-foreground
hover:bg-white/[0.05]
```

---

## 9. Новая структура главной страницы

```text
1. Navbar
2. Hero with URL check form
3. Product report preview
4. How it works
5. What the system checks
6. Evidence-based report section
7. Risk and fine calculation section
8. Use cases
9. Security and reliability
10. FAQ
11. Final CTA
12. Footer
```

---

## 10. Navbar

Новый navbar:

```text
PDn Control

Продукт
Как работает
Отчет
FAQ

Войти
Проверить сайт
```

Визуальные правила:

```text
- height: 64px
- sticky top
- bg-background/75
- backdrop-blur-xl
- border-b border-white/10
- logo слева
- nav links по центру или справа
- primary CTA справа
- mobile menu при необходимости
```

Logo direction:

```text
Можно использовать wordmark:
PDn Control

И маленький mark:
щит / scale / document-check / radar-circle
```

Не использовать emoji.

---

## 11. Hero section

Цель hero:

```text
За 5 секунд пользователь должен понять:
- что это;
- для кого;
- что он получит;
- что делать дальше.
```

### Hero copy

```text
Eyebrow:
Legal-tech compliance scanner

H1:
Проверка сайта на риски по 152-ФЗ

Subheading:
Введите URL — получите отчет о нарушениях, рисках обработки персональных данных и возможных штрафах.

Description:
PDn Control анализирует сайт, формы, политику конфиденциальности, SSL и технические признаки обработки ПДн. Результат — структурированный отчет с evidence и рекомендациями.
```

CTA:

```text
Primary: Проверить сайт
Secondary: Посмотреть пример отчета
```

Trust chips:

```text
152-ФЗ
Политика ПДн
Формы сбора данных
SSL / IP
PDF-отчет
AI-анализ
```

Hero layout:

```text
Left:
- eyebrow
- h1
- subheading
- URL input
- guest checks note
- trust chips

Right:
- gavel background
- floating ReportPreviewCard
- small scan status chips
```

---

## 12. URL check form

Текущую бизнес-логику формы не менять.

Оставить:

```text
- URL validation
- startCheck()
- loading state
- router.push(`/check?reqId=...`)
- sonner errors
```

Изменить только визуал:

```text
- larger rounded search bar
- elevated dark surface
- border-white/10
- focus glow
- button inside справа
- helper text below
```

Copy:

```text
Placeholder:
https://company.ru

Button:
Проверить сайт

Helper:
Бесплатно: 3 проверки без регистрации
```

Визуальный вид:

```text
[search icon] https://example.ru                         [Проверить сайт]
```

---

## 13. ReportPreviewCard

Это главный визуальный proof-блок вместо generic illustration.

Содержимое:

```text
Отчет по example.ru

Risk score: 72%
Статус: Есть нарушения

Найдено:
✕ Нет согласия на обработку ПДн в форме заявки
! Политика конфиденциальности требует обновления
✓ SSL-сертификат активен

Возможный штраф: до 700 000 ₽
```

Более детальная структура:

```text
Header:
- example.ru
- Проверка завершена · 24 сек

Main:
- Risk Score 72%
- Есть нарушения

Cards:
- Политика ПДн
- Формы и согласия
- SSL и безопасность
- География IP

Evidence:
<form action="/lead">
Найдена форма сбора данных без явного согласия
```

Визуально:

```text
- dark glass card
- thin border
- subtle inner shadow
- small mono labels
- status dots
- risk progress bar or ring
```

---

## 14. How it works

Copy:

```text
1. Введите URL
Мы запускаем crawler и собираем публичные страницы сайта.

2. Анализируем риски
Система проверяет формы, политику, SSL, IP, признаки обработки ПДн и юридические требования.

3. Формируем отчет
Вы получаете список нарушений, evidence, risk score и PDF-отчет.
```

Визуал:

```text
- 3 cards или horizontal timeline
- small icons
- subtle connecting line
- one clear sentence per step
```

Можно использовать реальные этапы проверки:

```text
Задача поставлена в очередь
Обработчик запускает проверку
Выполняется анализ сайта
Формируется отчет
```

---

## 15. What we check

Сетка карточек:

```text
Политика конфиденциальности
Проверяем наличие, доступность и полноту политики обработки ПДн.

Формы сбора данных
Ищем формы, поля ввода, согласия и потенциальные нарушения.

Согласие на обработку ПДн
Проверяем наличие явного согласия рядом с формами.

SSL и безопасность
Показываем базовые технические риски и статус сертификата.

Домены и IP
Определяем техническую инфраструктуру сайта.

AI-анализ текста
Формируем описание и юридические предупреждения на основе найденных данных.
```

Визуал:

```text
- 2x3 grid desktop
- 1 column mobile
- lucide icons
- muted card hover
- no heavy animation
```

---

## 16. Evidence-based report section

Главный смысл:

```text
Не просто оценка. Доказательная база по каждому риску.
```

Copy:

```text
Каждая проблема в отчете содержит:
- что найдено;
- почему это риск;
- на какой странице найдено;
- какие требования могут быть затронуты;
- что исправить.
```

Visual finding card:

```text
Нарушение

Форма обратной связи собирает телефон и email
без явного согласия на обработку ПДн.

Страница:
https://example.ru/contact

Evidence:
<input name="phone" />
<input name="email" />

Рекомендация:
Добавить чекбокс согласия и ссылку на политику.
```

Важно:

```text
- Evidence block должен выглядеть как technical artifact.
- Использовать mono font.
- Не перегружать юридическим текстом.
- Показывать конкретику.
```

---

## 17. Risk score / fines section

Copy:

```text
Риск-скоринг и оценка последствий

PDn Control не ограничивается списком ошибок. Система группирует результаты проверки, показывает общий риск и помогает понять приоритет исправлений.
```

Визуал:

```text
Risk score: 72%
Possible fine: up to 700 000 ₽
Passed: 8/14
Warnings: 3/14
Failed: 3/14
```

Важно:

```text
Если расчет штрафов еще не полностью готов, писать осторожно:
“оценка возможных штрафов”
а не:
“точный размер штрафа”
```

---

## 18. Use cases

Copy:

```text
Для владельцев сайтов
Быстро понять, есть ли базовые риски по ПДн.

Для веб-студий
Проверять сайты клиентов перед сдачей проекта.

Для юристов и DPO
Получать первичный технический срез перед ручным аудитом.

Для компаний
Контролировать публичные формы, политики и изменения на сайте.
```

Визуал:

```text
- 4 cards
- restrained icons
- concise descriptions
- no marketing fluff
```

---

## 19. Security and reliability section

Смысл:

```text
Показать заказчикам, что продукт не просто “скрейпер”, а аккуратная система проверки.
```

Copy ideas:

```text
Асинхронная проверка
Сканирование выполняется через worker-процесс и не блокирует интерфейс.

Проверка публичных данных
Система анализирует публично доступные страницы сайта.

Evidence-first отчет
Каждый вывод связан с найденными страницами, формами или техническими признаками.

PDF для передачи команде
Результат можно сохранить и передать разработчикам, юристам или заказчику.
```

---

## 20. FAQ

Вопросы:

```text
Это юридическое заключение?
Нет. PDn Control помогает провести первичный технический и контентный анализ сайта. Финальные юридические выводы должен подтверждать специалист.

Что проверяет сервис?
Формы сбора данных, политику конфиденциальности, согласия, SSL, технические признаки сайта и найденные страницы.

Можно ли проверить сайт без регистрации?
Да, можно запустить ограниченное число гостевых проверок.

Что я получу после проверки?
Структурированный отчет с найденными рисками, evidence, статусами проверок, risk score и PDF.

Сервис меняет мой сайт?
Нет. Проверка анализирует публично доступные страницы и не вносит изменения.
```

---

## 21. Final CTA

Copy:

```text
Проверьте сайт до того, как риски станут проблемой

Введите URL и получите первичный отчет по рискам обработки персональных данных.
```

CTA:

```text
[Проверить сайт]
```

Secondary note:

```text
Бесплатно: 3 проверки без регистрации
```

---

## 22. Progress page redesign

Логику не менять.

Текущие этапы можно визуально представить как scan console:

```text
Проверяем example.ru

42%

✓ Задача поставлена в очередь
✓ Обработчик запущен
● Анализируем страницы сайта
○ Формируем отчет
```

Добавить декоративный technical log:

```text
[12:41:02] crawler started
[12:41:04] found /privacy
[12:41:07] found form: /contact
[12:41:11] analyzing policy text
```

Визуальные правила:

```text
- centered scan console
- elevated card
- progress bar / circular indicator
- clear current stage
- no excessive loading animation
```

---

## 23. Result page redesign

Цель:

```text
Отчет должен выглядеть как enterprise compliance report, а не как набор одинаковых border blocks.
```

Новая структура:

```text
Top report summary
- URL
- дата проверки
- общий статус
- PDF download

Executive summary
- Risk score
- possible fine
- passed/warning/failed
- key finding

Evidence sections
- critical issues
- warnings
- passed checks

Technical details
- SSL
- IP / geo
- crawler evidence

Recommendations
- prioritized actions
```

Finding card:

```text
Critical finding:
- red left border
- issue title
- short explanation
- evidence block
- affected URL
- recommendation

Warning:
- amber left border

Passed:
- collapsed by default or lower visual priority
```

Правило:

```text
Не все карточки должны иметь одинаковый визуальный вес.
Сначала крупный summary dashboard.
Потом grouped findings.
Потом technical details.
```

---

## 24. Файловая структура компонентов

Создать:

```text
frontend/components/marketing/hero-section.tsx
frontend/components/marketing/report-preview-card.tsx
frontend/components/marketing/how-it-works.tsx
frontend/components/marketing/checks-grid.tsx
frontend/components/marketing/evidence-section.tsx
frontend/components/marketing/risk-section.tsx
frontend/components/marketing/use-cases.tsx
frontend/components/marketing/security-section.tsx
frontend/components/marketing/faq-section.tsx
frontend/components/marketing/final-cta.tsx
```

Для отчета:

```text
frontend/components/report/report-summary.tsx
frontend/components/report/risk-overview-card.tsx
frontend/components/report/finding-card.tsx
frontend/components/report/evidence-code-block.tsx
frontend/components/report/report-actions.tsx
```

Для прогресса:

```text
frontend/components/check/scan-progress-console.tsx
frontend/components/check/scan-stage-timeline.tsx
```

---

## 25. Конкретные изменения в текущих файлах

### frontend/lib/constants.ts

Было:

```ts
export const appName = "Compliance Checker";
```

Стало:

```ts
export const appName = "PDn Control";
```

### frontend/lib/data.ts

Было:

```ts
export const siteConfig = {
  name: "Compliance Checker",
  tagline: "Проверка сайтов на соответствие законодательству о персональных данных",
  description:
    "Сервис анализирует сайт через backend-проверки, показывает нарушения, предупреждения и отчет по требованиям 152-ФЗ.",
};
```

Стало:

```ts
export const siteConfig = {
  name: "PDn Control",
  tagline: "Проверка сайта на риски по 152-ФЗ",
  description:
    "Введите URL — получите отчет о нарушениях, рисках обработки персональных данных и возможных штрафах.",
};
```

### frontend/app/page.tsx

Страница должна стать композицией секций:

```tsx
import { HeroSection } from "@/components/marketing/hero-section";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { ChecksGrid } from "@/components/marketing/checks-grid";
import { EvidenceSection } from "@/components/marketing/evidence-section";
import { RiskSection } from "@/components/marketing/risk-section";
import { UseCases } from "@/components/marketing/use-cases";
import { SecuritySection } from "@/components/marketing/security-section";
import { FAQSection } from "@/components/marketing/faq-section";
import { FinalCTA } from "@/components/marketing/final-cta";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <HowItWorks />
      <ChecksGrid />
      <EvidenceSection />
      <RiskSection />
      <UseCases />
      <SecuritySection />
      <FAQSection />
      <FinalCTA />
    </div>
  );
}
```

### frontend/components/address-check-form.tsx

Логику оставить, изменить только классы:

```text
- wrapper: rounded-2xl border border-white/10 bg-background/70 p-1.5 shadow-xl backdrop-blur-xl
- focus: focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10
- input: h-12 text-base
- button: h-11 rounded-xl px-5
```

---

## 26. UI rules для Cursor/Codex

```md
# PDn Control UI Rules

We are redesigning the UI, not changing the core UX.

Product:
PDn Control is a legal-tech / cybersecurity SaaS that checks websites for compliance risks related to Russian Federal Law 152-FZ and personal data processing.

Reference:
Inspired by Resend's product-first, dark, premium SaaS storytelling. Do not copy Resend's layout, copy, typography, assets, colors, or visual objects.

Visual direction:
- Dark-first legal-tech SaaS
- Premium, calm, precise, trustworthy
- Use a gavel/law background only in the hero
- Use product report previews as the main visual proof
- Avoid generic AI gradients
- Avoid neon overload
- Avoid playful consumer-style design

Design principles:
- The website should feel like a compliance control room
- Product value must be shown through report previews, risk cards, evidence blocks, and scan states
- Use strong hierarchy, large typography, and generous spacing
- Use subtle borders, elevated surfaces, and restrained shadows
- Limit each section to one clear message

Tech constraints:
- Next.js
- Tailwind CSS
- shadcn/ui only
- lucide-react icons only
- sonner for feedback
- Do not add another UI library
- Keep existing scan flow and backend integration

Main page structure:
1. Navbar
2. Hero with URL check form and gavel background
3. Report preview card
4. How it works
5. What we check
6. Evidence-based report
7. Risk scoring and possible fines
8. Use cases
9. Security/reliability
10. FAQ
11. Final CTA
12. Footer

Hero requirements:
- Left side text and URL input
- Right side gavel photo background and floating report preview
- Strong headline
- Clear subheading
- CTA: Проверить сайт
- Secondary CTA: Посмотреть пример отчета
- Trust chips: 152-ФЗ, Политика ПДн, Формы, SSL, PDF-отчет, AI-анализ

Components:
- HeroSection
- ReportPreviewCard
- HowItWorks
- ChecksGrid
- EvidenceSection
- RiskSection
- UseCases
- SecuritySection
- FAQSection
- FinalCTA

Style:
- Use rounded-2xl for large cards
- Use border-white/10 style borders
- Use bg-card/elevated dark surfaces
- Use subtle inner highlights
- Use mono font for URLs, IPs, evidence and report IDs
- Use status colors consistently:
  - red for violations
  - amber for warnings
  - emerald for passed checks
  - blue/indigo for primary action
  - muted gold only as legal accent

Accessibility:
- Keep visible focus states
- Use sufficient contrast
- Do not communicate status by color alone
- Add text labels to status indicators

Do not:
- Rewrite backend flow
- Change API contract
- Remove AddressCheckForm logic
- Add fake complex functionality
- Add framer-motion unless absolutely necessary
- Add custom animation keyframes
```

---

## 27. Главный промпт для Cursor/Codex

```text
Redesign the frontend UI according to this blueprint.

Goal:
Make PDn Control look like a premium B2B legal-tech / cybersecurity SaaS inspired by Resend's product-first storytelling, without copying Resend.

Important:
The current UX and backend flow are mostly correct. Do not rewrite the scan logic. Improve the visual design, landing page structure, product presentation, spacing, typography, and component polish.

Repository context:
- Main page: frontend/app/page.tsx
- Global styles: frontend/app/globals.css
- Navbar: frontend/components/navbar.tsx
- URL scan form: frontend/components/address-check-form.tsx
- Progress page: frontend/components/check-progress-view.tsx
- Result page: frontend/components/result-view.tsx
- Stack: Next.js, Tailwind CSS, shadcn/ui, lucide-react, sonner

Tasks:
1. Update product naming from "Compliance Checker" to "PDn Control" where appropriate.
2. Create a premium dark-first visual system in globals.css.
3. Redesign the navbar as a modern SaaS navbar.
4. Redesign the home page with these sections:
   - HeroSection
   - ReportPreviewCard
   - HowItWorks
   - ChecksGrid
   - EvidenceSection
   - RiskSection
   - UseCases
   - SecuritySection
   - FAQSection
   - FinalCTA
5. Keep AddressCheckForm behavior, but improve its styling.
6. Add a gavel/law background to the hero using a local image path like /images/gavel-bg.jpg.
7. Add strong overlays so text remains readable.
8. Make all sections responsive.
9. Improve report/progress visual style only if it does not require backend changes.
10. Use only shadcn/ui and lucide-react.

Design requirements:
- Premium dark legal-tech SaaS
- Large typography
- Strong hierarchy
- Subtle borders
- Elevated cards
- Product preview instead of generic illustration
- Status colors for violations/warnings/passed checks
- Mono text for URLs, IPs, evidence snippets
- No generic AI gradients
- No copied Resend assets or copy

Deliverables:
- Updated frontend code
- Reusable marketing components
- Updated design tokens
- Short summary of changed files
- Notes for any assumptions
```

---

## 28. Более точный промпт только для главной страницы

```text
Redesign only the landing page and marketing components.

Do not touch backend, API functions, auth, result conversion, or check progress logic.

Files to edit:
- frontend/app/page.tsx
- frontend/app/globals.css if needed
- frontend/components/navbar.tsx if needed
- frontend/components/address-check-form.tsx only for styling
- create frontend/components/marketing/* components

Landing page structure:
1. HeroSection
2. ReportPreviewCard
3. HowItWorks
4. ChecksGrid
5. EvidenceSection
6. RiskSection
7. UseCases
8. SecuritySection
9. FAQSection
10. FinalCTA

Hero:
- Dark gavel background image on the right
- Text on the left
- Keep URL check form functional
- Add trust chips
- Add floating report preview

Copy language:
Russian, clear, B2B, legal-tech.
Tone: precise, serious, premium.

Do not create a Resend clone. Use Resend only as a reference for product-first storytelling and premium detail.
```

---

## 29. Приоритет внедрения

### Priority 1

```text
- appName/siteConfig
- navbar
- hero
- URL form styling
- report preview card
- globals.css tokens
```

### Priority 2

```text
- how it works
- checks grid
- evidence section
- risk section
- use cases
- FAQ
- final CTA
```

### Priority 3

```text
- progress page polish
- result page redesign
- PDF/report visual consistency
```

Рекомендация:

```text
Не начинать с полного result page redesign.
Сначала сделать главную, потому что именно она формирует первое впечатление у заказчиков.
```

---

## 30. Definition of Done

Редизайн можно считать готовым, если:

```text
1. Главная страница сразу объясняет, что делает PDn Control.
2. Hero выглядит как премиальный B2B SaaS, а не MVP.
3. URL form осталась функциональной.
4. Есть product preview отчета.
5. Есть evidence-based storytelling.
6. Есть risk score / штрафы / статусные карточки.
7. Navbar выглядит аккуратно и современно.
8. UI адаптирован для mobile/tablet/desktop.
9. Цвета, карточки, отступы и типографика консистентны.
10. Нет копирования Resend.
11. Нет новой UI-библиотеки.
12. Нет изменений backend-flow.
13. Сохранены visible focus states.
14. Статусы различаются не только цветом, но и текстом/иконкой.
15. Проект проходит lint/typecheck/build по локальным правилам репозитория.
```

---

## 31. Краткий итог для команды

```text
PDn Control должен выглядеть не как простой checker, а как legal-tech control room.

Главная страница должна продавать не “форму проверки”, а результат:
- отчет;
- evidence;
- risk score;
- возможные штрафы;
- понятные рекомендации.

Resend используется только как референс подхода:
product-first, dark, premium, precise.

Итоговый стиль:
dark legal-tech SaaS + gavel background + report preview + evidence-based UI.
```
