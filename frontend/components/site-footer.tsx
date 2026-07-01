import Link from "next/link";
import { appName } from "@/lib/constants";

const footerLinks = [
  {
    heading: "Продукт",
    links: [
      { label: "Возможности", href: "/" },
      { label: "Цены", href: "/" },
      { label: "API", href: "/" },
    ],
  },
  {
    heading: "Компания",
    links: [
      { label: "О нас", href: "/" },
      { label: "Блог", href: "/" },
      { label: "Контакты", href: "/" },
    ],
  },
  {
    heading: "Ресурсы",
    links: [
      { label: "Документация", href: "/" },
      { label: "152-ФЗ", href: "/" },
      { label: "База знаний", href: "/" },
    ],
  },
  {
    heading: "Правовая информация",
    links: [
      { label: "Политика конфиденциальности", href: "/" },
      { label: "Пользовательское соглашение", href: "/" },
      { label: "Обработка данных", href: "/" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="w-full border-t bg-card">
      <div className="grid grid-cols-2 gap-8 px-6 py-14 sm:px-10 sm:grid-cols-4 lg:grid-cols-12 lg:px-16 lg:py-16">
        {footerLinks.map((group) => (
          <div key={group.heading} className="lg:col-span-3">
            <h3 className="mb-4 text-sm font-semibold tracking-tight text-foreground">
              {group.heading}
            </h3>
            <ul className="space-y-2.5">
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t px-6 py-5 sm:px-10 lg:px-16">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {appName}. Все права защищены.
        </p>
      </div>
    </footer>
  );
}
