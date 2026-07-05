import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { appName } from "@/lib/constants";

const footerLinks = [
  {
    heading: "Продукт",
    links: [
      { label: "Возможности", href: "/#product" },
      { label: "Как работает", href: "/#how" },
      { label: "Пример отчета", href: "/#report" },
    ],
  },
  {
    heading: "Сценарии",
    links: [
      { label: "Юристам", href: "/" },
      { label: "Владельцам сайтов", href: "/" },
      { label: "Security-командам", href: "/" },
    ],
  },
  {
    heading: "Ресурсы",
    links: [
      { label: "FAQ", href: "/#faq" },
      { label: "152-ФЗ", href: "/" },
      { label: "PDF-отчет", href: "/result" },
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
    <footer className="relative w-full overflow-hidden border-t border-white/10 bg-background/90">
      <div className="relative z-10 mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.2fr_2fr] lg:px-10 lg:py-16">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-base font-semibold">
            <BrandMark />
            {appName}
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
            Legal-tech scanner для первичной проверки сайтов на риски обработки персональных данных.
          </p>
          <p className="mt-6 max-w-md text-xs leading-5 text-muted-foreground">
            &copy; {new Date().getFullYear()} {appName}. Все права защищены.
          </p>
        </div>

        <div className="grid min-w-0 grid-cols-2 gap-8 sm:grid-cols-4">
        {footerLinks.map((group) => (
          <div key={group.heading} className="min-w-0">
            <h3 className="mb-4 text-sm font-semibold tracking-tight text-foreground">
              {group.heading}
            </h3>
            <ul className="space-y-2.5">
              {group.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="break-words text-sm leading-5 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        </div>
      </div>
      <div className="pointer-events-none relative z-0 overflow-hidden px-0 pt-2">
        <p className="footer-project-word select-none text-center">
          {appName}
        </p>
      </div>
    </footer>
  );
}
