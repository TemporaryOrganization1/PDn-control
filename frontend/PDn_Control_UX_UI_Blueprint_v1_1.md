# PDn Control — UX/UI Blueprint v1.1

Цель: обновить общий UI blueprint с учетом новых правок: полностью прозрачный navbar в hero, почти прозрачный navbar после scroll, Resend-like section framing, более точные premium CTA buttons, короткий hero copy и auth pages без внешней card-рамки.

Этот документ дополняет и исправляет предыдущий `PDn_Control_UX_UI_Blueprint.md`. Правила ниже имеют приоритет над старыми формулировками.

---

## 1. Главные обязательные изменения

```text
1. Navbar в начальном состоянии должен быть полностью прозрачным.
2. После scroll navbar должен быть почти прозрачным, а не плотной панелью.
3. Секции нельзя разделять простой линией на всю ширину экрана.
4. Section line / frame не должен прилегать вплотную к тексту.
5. Primary CTA buttons не должны быть синими.
6. Все важные CTA должны выглядеть как dark glossy Resend-like buttons.
7. При active/pressed CTA становится белым, текст черным, вокруг появляется мягкое локальное свечение.
8. Hero description сокращается до одной фразы.
9. Auth pages должны быть как у Resend: форма без большой внешней card-рамки.
10. Новый оригинальный logo mark оставить, не возвращаться к generic shield.
```

---

## 2. Navbar

### 2.1 Top state — полностью прозрачный

В самом верху страницы navbar должен визуально сливаться с hero background.

```text
Нельзя:
- bg-background/...
- border-b
- backdrop-blur
- shadow
- видимая стеклянная плашка
- видимый прямоугольник navbar

Нужно:
- background: transparent;
- border-color: transparent;
- backdrop-filter: none;
- box-shadow: none;
- navbar виден только за счет logo, links и buttons.
```

Tailwind direction:

```text
bg-transparent
border-transparent
shadow-none
backdrop-blur-0
```

Визуальный критерий:

```text
На первом экране не должно быть видно панели navbar.
Должны быть видны только элементы навигации поверх hero.
```

### 2.2 Scrolled state — почти прозрачный

Когда пользователь начал скроллить, navbar становится немного заметнее, но все равно остается очень легким.

```text
Нужно:
- background очень слабый;
- blur мягкий;
- border bottom едва заметный;
- без плотной темной плашки;
- без тяжелой тени.
```

Recommended values:

```text
background: rgba(3, 4, 7, 0.28–0.42)
border-bottom: rgba(255, 255, 255, 0.06–0.10)
backdrop-blur: 12–18px
shadow: none or extremely subtle
```

Tailwind direction:

```text
bg-background/35
border-white/[0.08]
backdrop-blur-xl
shadow-none
```

### 2.3 Scroll behavior

```tsx
const [scrolled, setScrolled] = useState(false);

useEffect(() => {
  const onScroll = () => setScrolled(window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}, []);
```

Transition:

```text
duration-300 ease-out
```

---

## 3. Section framing вместо обычных линий

Текущая ошибка: линия разделения слишком близко к тексту и выглядит как обычный border.

Нужно сделать Resend-like section framing:

```text
- centered max-width wrapper;
- subtle rounded shell;
- thin top line внутри контейнера;
- мягкая верхняя подсветка;
- линия НЕ на всю ширину viewport;
- линия НЕ прилегает к heading;
- много воздуха между рамкой и контентом.
```

### 3.1 Обязательные отступы

```text
Минимальное расстояние от верхней линии/рамки до eyebrow: 40px.
Желательное расстояние desktop: 56–72px.

Минимальное расстояние от heading/subheading до cards/grid: 40px.
Желательное расстояние desktop: 48–64px.
```

### 3.2 Reusable component

Создать компонент:

```text
frontend/components/marketing/section-shell.tsx
```

Пример структуры:

```tsx
export function SectionShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div
          className={[
            "relative overflow-hidden rounded-[28px]",
            "border border-white/[0.08]",
            "bg-white/[0.012]",
            "px-6 py-14 sm:px-10 sm:py-18 lg:px-14 lg:py-20",
            className,
          ].join(" ")}
        >
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
          <div className="pointer-events-none absolute inset-x-10 top-0 h-24 bg-gradient-to-b from-white/[0.035] to-transparent" />
          <div className="relative z-10">{children}</div>
        </div>
      </div>
    </section>
  );
}
```

### 3.3 Что запрещено

```text
- border-top на всю ширину страницы;
- border-b у каждой секции от края до края;
- heading сразу под линией;
- line flush with content;
- слишком яркая рамка;
- превращать каждую секцию в тяжелую карточку.
```

---

## 4. Premium CTA buttons в стиле Resend

Кнопки должны быть описаны и реализованы гораздо точнее. Все важные CTA должны иметь один стиль.

Затрагивает:

```text
- “Проверить сайт”
- navbar CTA
- hero CTA
- final CTA
- login submit
- signup submit
- другие primary action buttons
```

### 4.1 Default state

Кнопка должна выглядеть как Resend-style dark glossy button:

```text
- не синяя;
- темная;
- полупрозрачная;
- glossy / glassy;
- rounded-2xl или pill;
- тонкая рамка;
- внутренний верхний highlight;
- мягкая глубина;
- белый текст;
- premium, плотная, аккуратная.
```

Tailwind direction:

```text
rounded-2xl
border border-white/10
bg-gradient-to-b from-white/[0.14] to-white/[0.06]
text-white
font-semibold
shadow-[inset_0_1px_0_rgba(255,255,255,0.14),inset_0_-1px_0_rgba(0,0,0,0.35),0_12px_32px_rgba(0,0,0,0.35)]
```

### 4.2 Hover state

```text
- чуть светлее;
- рамка чуть заметнее;
- без синего цвета;
- ощущение “кнопка подсветилась”, но не neon.
```

Tailwind direction:

```text
hover:from-white/[0.18]
hover:to-white/[0.085]
hover:border-white/18
hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(0,0,0,0.35),0_14px_38px_rgba(0,0,0,0.42)]
```

### 4.3 Active / pressed state

При нажатии кнопка должна становиться светлой:

```text
- background становится белым или почти белым;
- text становится черным;
- вокруг появляется небольшое локальное свечение;
- свечение короткое, не большое;
- кнопка чуть “нажимается” вниз на 1px.
```

Tailwind direction:

```text
active:bg-white
active:text-black
active:border-white
active:translate-y-px
active:shadow-[0_0_0_1px_rgba(255,255,255,0.35),0_0_28px_rgba(255,255,255,0.22),inset_0_1px_0_rgba(255,255,255,0.8)]
```

### 4.4 Focus-visible

```text
- focus должен быть доступным;
- не синий;
- бело-серый мягкий ring.
```

Tailwind direction:

```text
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-white/35
focus-visible:ring-offset-2
focus-visible:ring-offset-background
```

### 4.5 Disabled state

```text
- кнопка остается в premium style;
- opacity 50–60%;
- без glow;
- cursor-not-allowed;
- не превращать в flat gray rectangle.
```

### 4.6 Implementation

Создать reusable variant:

```text
buttonVariants({ variant: "premium" })
```

или utility:

```css
.btn-premium
```

И использовать этот вариант для всех важных CTA. Не оставлять часть кнопок синими.

---

## 5. Hero

Hero должен стать короче и сильнее.

### 5.1 Оставить только этот description

```text
Введите URL — получите отчет о нарушениях, рисках обработки персональных данных и возможных штрафах.
```

### 5.2 Удалить длинный абзац

Удалить или не рендерить дополнительный абзац типа:

```text
PDn Control анализирует сайт, формы, политику конфиденциальности, SSL...
```

### 5.3 Новая структура hero

```text
Eyebrow:
Legal-tech compliance scanner / короткий русский аналог

H1:
Проверка сайта на риски по 152-ФЗ

Description:
Введите URL — получите отчет о нарушениях, рисках обработки персональных данных и возможных штрафах.

URL form
Trust chips
Report preview
```

Цель:

```text
меньше текста → больше воздуха → сильнее фокус на форме и report preview.
```

---

## 6. Auth pages: login/signup без внешней card-рамки

Предыдущая формулировка была недостаточно точной. Нужно сделать именно как на Resend reference: **никакой большой рамки вокруг всей формы**.

### 6.1 Главное правило

```text
НЕ помещать login/signup форму в большую bordered card.
НЕ делать общий прямоугольный wrapper с рамкой.
НЕ делать форму как “modal/card”.

Форма должна находиться прямо на темном атмосферном фоне.
Каждый input/button имеет собственную surface, но вся форма не обведена рамкой.
```

### 6.2 Layout

```text
- full-screen dark background;
- centered auth column;
- max-width примерно 520–560px;
- logo сверху по центру;
- title;
- subtitle/link to signup/login;
- social buttons;
- divider;
- inputs;
- submit button;
- legal text.
```

Tailwind direction:

```text
min-h-screen
bg-background
mx-auto
flex
w-full
max-w-[560px]
flex-col
justify-center
px-6
py-16
```

Без:

```text
border
rounded outer card
bg-card outer wrapper
shadow outer card
```

### 6.3 Background как у Resend

Можно добавить мягкий абстрактный свет/форму, но не рамку:

```css
.auth-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at 82% 8%, rgba(255,255,255,0.16), transparent 18%),
    radial-gradient(circle at 50% 100%, rgba(255,255,255,0.055), transparent 34%),
    #030407;
}
```

Можно использовать pseudo-element:

```text
top-right large soft gray/white sphere/arc
subtle grain/noise
no heavy decoration
```

### 6.4 Logo on auth

```text
- logo mark centered;
- small glossy rounded-square container allowed;
- no generic shield;
- same mark as navbar.
```

### 6.5 Social buttons

Должны быть Resend-like:

```text
- dark glossy;
- rounded-2xl;
- border white/10;
- inner highlight;
- icon + text;
- two columns desktop;
- stacked mobile;
- no blue.
```

Tailwind direction:

```text
h-12 rounded-2xl border border-white/10
bg-gradient-to-b from-white/[0.13] to-white/[0.055]
text-white
shadow-[inset_0_1px_0_rgba(255,255,255,0.13),0_12px_32px_rgba(0,0,0,0.32)]
hover:from-white/[0.17]
hover:to-white/[0.075]
```

### 6.6 Divider

```text
line + “or” + line;
тонко;
white/10;
достаточный vertical spacing;
не прижимать к buttons/input.
```

### 6.7 Inputs

Inputs должны быть крупными и glossy:

```text
- height 52–56px;
- rounded-2xl;
- dark translucent gray;
- border white/10;
- inner top highlight;
- readable placeholder;
- focus: border white/20 + soft white glow;
- no blue focus ring;
- no flat black inputs.
```

Tailwind direction:

```text
h-14 rounded-2xl border border-white/10
bg-white/[0.09]
px-4 text-base text-white
placeholder:text-white/35
shadow-[inset_0_1px_0_rgba(255,255,255,0.10),inset_0_-1px_0_rgba(0,0,0,0.28)]
focus-visible:border-white/22
focus-visible:ring-4
focus-visible:ring-white/[0.055]
```

### 6.8 Submit button

```text
Использовать premium CTA variant из раздела 4.
```

### 6.9 Legal text

```text
small muted centered text;
links underlined or slightly brighter;
no card border.
```

### 6.10 Что запрещено

```text
- large bordered auth card;
- bg-card wrapper around entire form;
- visible rectangle behind the whole form;
- blue buttons;
- blue focus rings;
- flat black inputs.
```

---

## 7. Logo

Новый logo mark оставить, если он уже реализован хорошо.

Правила:

```text
- не возвращаться к generic shield;
- не использовать простой щит;
- logo должен быть оригинальным, monochrome, technical, minimal;
- подходит для navbar, favicon, auth page.
```

---

## 8. Updated Codex prompt

```text
Apply UI corrections from PDn Control UX/UI Blueprint v1.1.

Do not change backend logic, API contracts, auth behavior, validation behavior, scan flow or routing. Change only UI, styling, layout, components and visual states.

1. Navbar:
- At page top, navbar must be fully transparent.
- No visible background, no visible border, no blur panel, no shadow.
- It must visually merge with the hero background.
- Only logo/links/buttons should be visible.
- After scrollY > 8–12px, navbar becomes almost transparent:
  bg-background/30–40, border-white/6–10, backdrop-blur-xl.
- It must still be lighter and more transparent than the current version.
- Add smooth 250–350ms transition.

2. Section dividers:
- Remove plain full-width divider lines.
- Implement Resend-like section framing:
  centered max-width shell, subtle rounded border/top line, soft highlight.
- The line must not be close to the text.
- Add at least 40px, preferably 56–72px, between top line and section content.
- Create reusable SectionShell and apply to major marketing sections.

3. Buttons:
- Replace blue primary buttons with Resend-like dark glossy CTA buttons.
- Default: dark translucent gradient, white text, rounded-2xl/pill, border-white/10, inner top highlight, soft depth shadow.
- Hover: slightly brighter, border slightly brighter, no blue.
- Active/pressed: white background, black text, small local white glow, translate-y-px.
- Focus-visible: white/gray accessible focus ring, not blue.
- Apply this style to all important CTA buttons: Проверить сайт, auth submit, navbar CTA, final CTA.

4. Logo:
- Keep the new original logo if already implemented.
- Do not use generic shield.

5. Hero:
- Shorten hero description.
- Keep only:
  “Введите URL — получите отчет о нарушениях, рисках обработки персональных данных и возможных штрафах.”
- Remove the longer extra description paragraph.

6. Login/signup:
- Redesign auth pages like Resend.
- No large card border/wrapper around the whole form.
- Centered form directly on dark atmospheric background.
- Logo centered above title.
- Social buttons are dark glossy.
- Inputs are large glossy rounded fields.
- Submit button uses the new premium CTA style.
- Divider is subtle: line + “or” + line.
- No blue focus rings.
- Do not change auth logic.

Return:
- changed files list;
- short explanation of navbar behavior;
- section shell implementation;
- button variant implementation;
- auth page visual changes.
```

---

## 9. Definition of Done

```text
1. Navbar в самом верху полностью прозрачный.
2. Navbar после скролла почти прозрачный, не плотный.
3. Нет full-width грубых линий между секциями.
4. Section line/framing не прилегает к тексту.
5. CTA buttons не синие.
6. CTA buttons выглядят как dark glossy Resend-like controls.
7. Active CTA становится белым с черным текстом и мягким локальным glow.
8. Hero description сокращен до одной фразы.
9. Login/signup не имеют внешней card-рамки.
10. Auth inputs/buttons выглядят как часть premium dark system.
11. Логотип не generic shield.
12. Backend/API/scan/auth logic не изменены.
13. UI адаптивен.
14. Hover/focus/active states консистентны.
```
