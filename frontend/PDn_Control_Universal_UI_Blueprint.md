# PDn Control — Universal UX/UI Blueprint

Версия: 2.0  
Статус: основной дизайн-blueprint проекта.  
Основан на:

- `PDn_Control_UX_UI_Blueprint.md`
- `PDn_Control_UX_UI_Blueprint_v1_1.md`
- текущих правках главной страницы, auth pages, navbar, section framing, report preview и Docker-friendly frontend deployment
- дизайн-решениях из переписки

Этот документ имеет приоритет над предыдущими blueprint-файлами, если между ними есть противоречие.

---

## 1. Главная идея

PDn Control должен выглядеть не как MVP-checker, а как премиальный legal-tech / cybersecurity SaaS:

```text
dark legal-tech control room
точный
спокойный
доказательный
технический
дорогой
без визуального шума
```

Главная метафора:

```text
Compliance control room, который показывает риски сайта через отчет, evidence, статусы и приоритеты.
```

Дизайн должен продавать не форму проверки, а результат:

- понятный отчет;
- evidence;
- risk score;
- возможные штрафы;
- историю проверок;
- личный кабинет как рабочее место пользователя.

---

## 2. Референс

Resend использовать как референс принципов, не как шаблон для копирования.

Берем:

- dark premium SaaS;
- product-first storytelling;
- короткие уверенные тексты;
- много воздуха;
- тонкие поверхности;
- аккуратные glossy controls;
- ощущение технической точности.

Не копируем:

- layout Resend pixel-perfect;
- тексты;
- ассеты;
- 3D-объекты;
- конкретные цвета;
- композиции один в один.

---

## 3. Непереговорные правила

```text
1. Backend/API/auth/scan flow не менять ради дизайна.
2. Важные CTA не синие.
3. CTA по умолчанию темные glossy.
4. CTA при hover становятся белыми, текст черным, появляется мягкое локальное свечение.
5. Active/pressed только слегка нажимает кнопку вниз, а не является главным белым состоянием.
6. Navbar на главной в hero полностью прозрачный.
7. Navbar после scroll почти прозрачный, легкий, без плотной панели.
8. Секции не разделяются full-width border lines.
9. Большие секционные рамки подсвечены сверху как лампой и исчезают вниз до середины.
10. Цвет статусов в premium preview используется как glow, а не как прямой цвет текста/рамки.
11. Auth pages без большой внешней card-рамки.
12. Logo mark не generic shield.
13. Focus states видимые, но не синие.
14. UI адаптивен.
```

---

## 4. Визуальная концепция

Название:

```text
Legal Cyber Control Room
```

Ощущение:

```text
темная комната контроля
юридическая точность
техническое evidence
сдержанная премиальность
```

Нельзя:

- neon cyberpunk;
- яркий AI startup gradient;
- bootstrap dashboard;
- тяжелые карточки в каждой секции;
- юридическая “адвокатская” золотая тема;
- много синих primary-элементов;
- красный/желтый/зеленый “светофор” как основной стиль.

Можно:

- почти черный фон;
- графитовые поверхности;
- white/gray highlights;
- мягкий top light;
- статусный цвет только как приглушенный glow;
- mono text для report id, URL, IP, evidence;
- lucide icons.

---

## 5. Цветовая система

База:

```text
Background: почти черный, не чистый #000
Surface: графитовый/черный translucent
Elevated surface: темная glossy surface
Border: white 6-12%
Text primary: warm white
Text secondary: muted cold gray
Focus ring: white/gray, not blue
```

Основные токены:

```css
:root {
  --radius: 16px;
  --background: oklch(0.055 0.012 260);
  --foreground: oklch(0.94 0.01 260);
  --card: oklch(0.095 0.014 260);
  --muted: oklch(0.16 0.016 260);
  --muted-foreground: oklch(0.68 0.02 260);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 14%);
  --ring: oklch(1 0 0 / 35%);
}
```

Статусные цвета:

```text
Danger / Warning / Success существуют, но в premium preview и важных блоках используются как подсветка.
Текст, рамка и иконка остаются нейтральными.
```

Правильно:

```text
нейтральная карточка + мягкое красное/желтое/зеленое свечение внутри
```

Неправильно:

```text
красная рамка + красная иконка + красный текст + красный фон
```

---

## 6. Типографика

Шрифт:

```text
Geist для интерфейса
mono для URL, report id, evidence, IP, технических логов
```

Размеры:

```text
Hero H1 desktop: 56-72px
Hero H1 mobile: 36-44px
Section H2 desktop: 36-48px
Section H2 mobile: 28-34px
Body: 16-18px
Small UI: 12-14px
Mono/data: 12-14px
```

Правила:

- заголовки короткие;
- не использовать отрицательный letter-spacing;
- не делать весь UI одним размером;
- UI-тексты должны быть спокойными и точными;
- hero copy всегда короткий.

---

## 7. Layout и spacing

Общие правила:

```text
max-width для основного контента: 7xl
горизонтальные отступы: px-5 sm:px-8 lg:px-10
вертикальные секции: py-20 sm:py-24 lg:py-28
внутри больших shell: py-14 sm:py-16 lg:py-20
минимум 40px между рамкой/верхней подсветкой и heading
минимум 40px между heading/subheading и grid/cards
```

Mobile:

- все grids переходят в одну колонку;
- preview не должен ломать ширину;
- кнопки и inputs не должны клипаться;
- большие декоративные элементы можно упрощать.

---

## 8. Navbar

### Главная страница

Top state:

```text
полностью прозрачный
без background
без border
без blur
без shadow
видны только logo, links, actions
```

Scrolled state:

```text
bg-background/30-40
border-white/[0.06-0.10]
backdrop-blur-xl
shadow-none
transition duration-300 ease-out
```

Behavior:

```tsx
const [scrolled, setScrolled] = useState(false);

useEffect(() => {
  const onScroll = () => setScrolled(window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}, []);
```

### Внутренние страницы

Для личного кабинета, результата и настроек navbar может быть sticky с легкой translucent-поверхностью:

```text
bg-background/35
border-white/[0.08]
backdrop-blur-xl
shadow-none
```

Не делать плотную темную плашку.

### Навигация

Desktop:

```text
logo слева
основные links по центру
account/actions справа
```

Mobile:

```text
сохранить logo и главный action
не допускать переноса navbar в две строки
```

Badge рядом с account links не нужен, если он визуально шумит.

---

## 9. Logo

Использовать текущий оригинальный technical mark.

Правила:

- не generic shield;
- monochrome;
- minimal;
- подходит для navbar, auth, favicon;
- можно помещать в маленький glossy rounded-square container.

---

## 10. Premium CTA

Главный CTA стиль применяется к:

- `Проверить сайт`;
- navbar CTA;
- hero CTA;
- final CTA;
- login submit;
- signup submit;
- важные primary actions в личном кабинете.

Default:

```text
dark translucent glossy
border white/10
rounded-2xl
white text
inner top highlight
soft depth shadow
```

Hover:

```text
background becomes white
text becomes black
border white
small local white glow
no blue
```

Active:

```text
translate-y: 1px
slightly tighter shadow
does not define the main white state
```

Focus-visible:

```text
white/gray accessible ring
no blue ring
```

Disabled:

```text
opacity 50-60%
same premium shape
cursor-not-allowed
no big glow
```

Implementation direction:

```text
buttonVariants({ variant: "premium" })
or .premium-cta utility
```

---

## 11. Inputs

Glossy input style:

```text
h-14
rounded-2xl
border-white/10
bg-white/[0.08-0.10]
text-white
placeholder white/35
inner top highlight
focus border-white/20
focus ring white/[0.055]
```

No:

- flat black inputs;
- blue focus;
- small cramped fields.

---

## 12. SectionShell

Используется для крупных marketing sections и может быть адаптирован для внутренних dashboard blocks.

Обязательная идея:

```text
рамка не должна быть обычным прямоугольником
рамка видна сверху
рамка становится прозрачнее сверху вниз
чуть выше середины рамки уже не видно
верх выглядит так, будто его освещает небольшая лампа
свет плавно сливается с фоном
```

Structure:

```tsx
<section className="relative py-20 sm:py-24 lg:py-28">
  <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
    <div className="section-lamp-frame relative overflow-hidden rounded-[28px] px-6 py-14 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
      <div className="relative z-10">{children}</div>
    </div>
  </div>
</section>
```

CSS direction:

```css
.section-lamp-frame {
  position: relative;
  border: 0;
  background:
    radial-gradient(ellipse 70% 46% at 50% 0%, rgba(255,255,255,.10), transparent 74%),
    linear-gradient(180deg, rgba(255,255,255,.012), transparent 42%),
    rgba(0,0,0,.12);
}

.section-lamp-frame::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(
    to bottom,
    rgba(255,255,255,.13) 0%,
    rgba(255,255,255,.09) 18%,
    rgba(255,255,255,.04) 34%,
    rgba(255,255,255,0) 46%
  );
  mask-composite: exclude;
  pointer-events: none;
}
```

Запрещено:

- full-width border-top;
- full-width border-b между секциями;
- рамка от края до края viewport;
- яркая карточная рамка вокруг каждой секции;
- line flush with heading.

---

## 13. Surfaces и cards

Base surface:

```text
rounded-2xl
border-white/10
bg-white/[0.03-0.04]
soft inner highlight
```

Elevated surface:

```text
rounded-2xl
border-white/10-12
bg-gradient-to-b from-white/[0.08] to-white/[0.025]
shadow 0 24px 80px rgba(0,0,0,.35)
backdrop blur where useful
```

Nested cards:

```text
не злоупотреблять
если shell уже есть, внутренние cards должны быть легче
```

Hover:

```text
можно слегка поднять или подсветить border
никакого яркого glow на обычных cards
```

---

## 14. Hero

Текущий approved hero:

```text
H1:
Проверка сайта на риски по 152-ФЗ

Description:
Введите URL — получите отчет о нарушениях, рисках обработки персональных данных и возможных штрафах.

URL form
Guest checks badge
Secondary link: Посмотреть пример отчета
Right: ReportPreviewCard
```

Убрано и не возвращать без необходимости:

- hero eyebrow `Legal-tech compliance scanner`;
- trust chips под формой;
- маленькие scan status cards над preview;
- подпись под preview о публичных страницах.

Hero background:

```text
темный gavel/law background справа
сильный overlay
левая текстовая область почти черная
preview справа поверх атмосферы
```

Report preview справа:

```text
должен постепенно становиться прозрачным сверху вниз
низ preview полностью растворяется
fade должен быть ровным и красивым
```

Implementation:

```css
.hero-report-preview-fade {
  mask-image: linear-gradient(to bottom, black 0%, black 48%, rgba(0,0,0,.58) 76%, transparent 100%);
}
```

---

## 15. Report Preview

Это главный visual proof на landing.

Правила:

```text
1. Не использовать прямые яркие red/yellow/green text/border/fill.
2. Статусные цвета присутствуют только как мягкое освещение.
3. Текст, рамки и иконки нейтральные.
4. Цвет должен ощущаться как ambient glow под поверхностью.
5. Status должен быть понятен текстом, не только цветом.
```

Pattern:

```text
neutral card
white/10 border
muted text
status label
semantic glow class:
  report-glow-danger
  report-glow-warning
  report-glow-success
```

CSS direction:

```css
.report-glow {
  --report-glow-rgb: 255 255 255;
  position: relative;
  overflow: hidden;
}

.report-glow::before {
  content: "";
  position: absolute;
  inset: -55%;
  background: radial-gradient(
    ellipse at 18% 50%,
    rgb(var(--report-glow-rgb) / 24%),
    rgb(var(--report-glow-rgb) / 10%) 24%,
    rgb(var(--report-glow-rgb) / 3.5%) 43%,
    transparent 68%
  );
  filter: blur(12px);
  pointer-events: none;
}
```

---

## 16. Auth Pages

Login/signup style:

```text
full-screen dark atmospheric background
centered column max-width 520-560px
logo centered above title
no large outer card
no bordered wrapper around whole form
each input/button has its own surface
```

No:

- `border bg-card p-8` wrapper;
- modal-looking form;
- blue buttons/focus;
- flat black inputs.

Fields:

```text
large glossy rounded input shells
icon left
h-14
soft white focus glow
```

Submit:

```text
premium CTA
hover white
```

Legal text:

```text
small muted centered
links slightly brighter / underlined
```

---

## 17. Main Landing Structure

Recommended:

```text
1. Navbar
2. Hero
3. How it works
4. What system checks
5. Evidence-based report
6. Risk/fine calculation
7. Use cases
8. Security/reliability
9. FAQ
10. Final CTA
11. Footer
```

Each section:

```text
one clear message
short heading
short supporting paragraph
cards only if they show real product meaning
```

---

## 18. Personal Cabinet / Dashboard Blueprint

Личный кабинет должен быть тем же premium control room, но более плотным и рабочим.

Цель:

```text
пользователь быстро видит состояние аккаунта, историю проверок, тариф, лимиты и действия
```

Не делать:

- обычный bootstrap dashboard;
- много ярких карточек;
- тяжелые рамки вокруг каждого блока;
- цветные badges везде;
- маркетинговый landing внутри кабинета.

### Dashboard layout

Desktop:

```text
top navbar
optional left/account nav
main content max-width 7xl
section groups with light surfaces
```

Mobile:

```text
single column
actions near relevant content
tables become cards
```

### Profile overview

Blocks:

```text
Account summary
Plan / subscription
Guest or user limits
Recent checks
Reports
Settings shortcuts
Danger zone
```

Use cards, but keep them light:

```text
rounded-2xl
border-white/10
bg-white/[0.025-0.04]
no heavy nested card frames
```

### History page

Preferred:

```text
header with title + filters
summary row
list/table of checks
each item shows:
  URL
  status
  date
  risk summary
  report action
```

Status:

```text
neutral text + small icon + optional subtle glow
not bright red/yellow/green filled badges
```

Tables:

```text
desktop: compact rows with subtle dividers
mobile: stacked cards
hover: slight bg-white/[0.035]
```

### Settings forms

Use auth/input styling:

```text
large glossy input shells
white focus glow
premium submit
secondary actions as subtle outline/ghost
```

### Subscription page

Plans:

```text
do not use bright blue highlighted plan
highlight with subtle white border/top lamp/gloss
primary plan action uses premium CTA
```

Paid/free labels:

```text
neutral badges
muted text
avoid noisy green badges unless absolutely needed
```

### Danger zone

Danger actions can use destructive semantics, but keep the system restrained:

```text
neutral dark card
subtle red glow or red border 12-18%
clear copy
confirmation dialog required
```

---

## 19. Progress Page

Mood:

```text
scan console
technical but calm
```

Elements:

```text
URL being checked
progress percentage
current stage
timeline
worker/status info
technical log style block
```

Visual:

```text
dark elevated console
mono logs
subtle progress bar
no big spinner-only page
```

Do not change polling/API behavior.

---

## 20. Result Page

Should feel like:

```text
enterprise compliance report
```

Structure:

```text
1. Report header
2. Executive summary
3. Risk/fine overview
4. Critical findings
5. Warnings
6. Passed checks
7. Technical evidence
8. PDF/actions
```

Finding cards:

```text
neutral base
severity communicated by label + icon + subtle glow
evidence in mono block
affected URLs visible
recommendation clear
```

No:

- equal visual weight for all findings;
- color-only severity;
- huge red/yellow/green blocks.

---

## 21. Footer

Footer should be quiet:

```text
border-top white/10 acceptable
bg-background/90
small muted links
logo + short description
```

Do not overdecorate footer.

---

## 22. Empty, Loading, Error States

Empty:

```text
small centered state
muted copy
one clear action
no huge illustration
```

Loading:

```text
subtle spinner or progress skeleton
prefer real stage text where possible
```

Error:

```text
clear human message
technical code optional in muted mono
retry action
destructive color only as subtle glow/border
```

---

## 23. Motion

Motion should be restrained:

- transitions 150-300ms;
- ease-out;
- hover lift no more than 1-2px;
- no large animated gradients;
- no framer-motion unless necessary;
- no distracting looping animations in operational pages.

---

## 24. Accessibility

Required:

- visible focus states;
- focus ring white/gray, not blue;
- status not color-only;
- icons have text labels or adjacent copy;
- sufficient contrast;
- buttons are real buttons/links;
- form labels are present;
- mobile tap targets large enough.

---

## 25. Implementation Constraints

Stack:

```text
Next.js
Tailwind CSS
shadcn/ui where already used
lucide-react icons
sonner
```

Do not add:

- new UI framework;
- heavy animation library;
- unrelated state management;
- decorative SVG systems for product visuals.

Prefer:

- existing components;
- shared utility classes in `globals.css`;
- reusable variants like `premium`;
- local component patterns.

---

## 26. Copywriting Rules

Tone:

```text
serious
clear
B2B
legal-tech
no hype
```

Good:

```text
Проверка сайта на риски по 152-ФЗ
Введите URL — получите отчет о нарушениях, рисках обработки персональных данных и возможных штрафах.
Отчет объясняет, где найден риск и почему он важен.
```

Avoid:

```text
революционный AI
мгновенно решит все юридические проблемы
100% соответствие закону
точный штраф
```

Legal caution:

```text
использовать “возможный штраф”, “первичная проверка”, “риск”, “evidence”
не обещать юридическое заключение
```

---

## 27. Page-Specific Quick Rules

### Landing

```text
emotional/product-first
large typography
hero report preview
section lamp frames
minimal visual clutter
```

### Auth

```text
centered form
no outer card
glossy inputs
premium submit
```

### Profile

```text
operational
dense but calm
tables/lists readable
actions close to content
```

### Result

```text
report-like
grouped findings
evidence-first
neutral severity with glow
```

### Progress

```text
scan console
real stage text
subtle logs
```

---

## 28. Design Do / Don't

Do:

- use dark premium surfaces;
- use top lamp highlights;
- use fading borders;
- use neutral cards with semantic glow;
- keep primary flow obvious;
- use mono for evidence/data;
- make mobile layouts stable.

Don't:

- use blue primary buttons;
- use full-width section separators;
- use heavy bordered wrappers everywhere;
- use loud status colors as text/fill;
- add marketing fluff to operational pages;
- copy Resend directly;
- change backend flow for UI polish.

---

## 29. Codex/Cursor Prompt

```text
Apply PDn Control Universal UX/UI Blueprint v2.

Change only UI, styling, layout, component structure, visual states and copy.
Do not change backend logic, API contracts, auth behavior, validation behavior, scan flow or routing.

Visual direction:
- premium dark legal-tech / cybersecurity SaaS
- calm compliance control room
- Resend-inspired precision without copying
- dark glossy controls
- white-hover premium CTA
- section frames with top lamp illumination and border fading before the middle
- status colors as glow, not direct colored UI
- no full-width divider lines
- no blue focus rings

For personal cabinet:
- build an operational dashboard, not a marketing page
- use dense but calm cards/tables
- keep actions close to relevant content
- use neutral surfaces and subtle status glow
- forms use glossy inputs and premium submit

Always verify:
- lint
- typecheck
- build
```

---

## 30. Definition of Done

Design work is done when:

```text
1. UI feels like premium legal-tech SaaS.
2. Main CTA hover becomes white with black text.
3. Buttons have consistent default/hover/active/focus states.
4. Navbar is transparent in hero and lightweight after scroll.
5. Section shells use top lamp illumination.
6. Section borders fade out before the middle.
7. No rough full-width separators.
8. Report preview uses neutral UI plus semantic glow.
9. Hero is concise and not cluttered.
10. Auth pages have no outer card frame.
11. Personal cabinet is operational, dense, and calm.
12. Status is never communicated by color alone.
13. Mobile layout is stable.
14. Backend/API/auth/scan flow is untouched.
15. lint/typecheck/build pass or known unrelated warnings are documented.
```

