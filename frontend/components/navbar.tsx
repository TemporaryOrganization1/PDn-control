"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";

const linkBase =
  "inline-flex h-9 items-center justify-center rounded-full px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25";

const navLinks = [
  { label: "Продукт", href: "/#product" },
  { label: "Как работает", href: "/#how" },
  { label: "Отчет", href: "/#report" },
  { label: "FAQ", href: "/#faq" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoggedIn, isLoading, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const isHomePage = pathname === "/";

  useEffect(() => {
    const updateScrolled = () => {
      setIsScrolled(window.scrollY > 12);
    };

    updateScrolled();
    window.addEventListener("scroll", updateScrolled, { passive: true });

    return () => window.removeEventListener("scroll", updateScrolled);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Вы вышли из аккаунта");
      router.push("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не удалось выйти");
    }
  };

  return (
    <header
      className={cn(
        "top-0 z-50 w-full border-b transition-all duration-300 ease-out",
        isHomePage ? "fixed" : "sticky",
        isScrolled
          ? "border-white/[0.08] bg-background/35 shadow-none backdrop-blur-xl"
          : "border-transparent bg-transparent shadow-none backdrop-blur-0"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25"
        >
          <BrandMark />
          <span className="whitespace-nowrap text-base">PDn Control</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkBase}>
              {link.label}
            </Link>
          ))}
          <Link
            href="/result"
            className={cn(linkBase, pathname === "/result" && "bg-white/[0.07] text-foreground")}
          >
            Результаты
          </Link>
        </nav>

        <nav className="flex items-center gap-2">
          {isLoading ? null : isLoggedIn && user ? (
            <>
              <Link
                href="/profile"
                className={cn(linkBase, pathname.startsWith("/profile") && "bg-white/[0.07] text-foreground")}
              >
                <User className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Личный кабинет</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className={cn(linkBase, "bg-transparent")}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Выйти</span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden h-10 items-center justify-center px-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25 sm:inline-flex"
              >
                Войти
              </Link>
              <Link
                href="/#product"
                className="premium-cta inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold"
              >
                <span className="sm:hidden">Проверить</span>
                <span className="hidden sm:inline">Проверить сайт</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
