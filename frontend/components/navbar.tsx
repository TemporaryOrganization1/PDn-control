"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const linkBase =
  "inline-flex h-9 items-center justify-center rounded-sm px-4 text-sm font-bold transition-colors hover:bg-accent";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoggedIn, isLoading, logout } = useAuth();

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
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Compliance Checker
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/"
            className={cn(linkBase, pathname === "/" && "bg-accent text-foreground")}
          >
            Проверка
          </Link>
          <Link
            href="/result"
            className={cn(linkBase, pathname === "/result" && "bg-accent text-foreground")}
          >
            Результаты
          </Link>
          {isLoading ? null : isLoggedIn && user ? (
            <>
              <Link
                href="/profile"
                className={cn(linkBase, pathname.startsWith("/profile") && "bg-accent text-foreground")}
              >
                <User className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Личный кабинет</span>
                <Badge variant="outline" className="ml-2 border-emerald-500/20 text-[8px] text-emerald-500">
                  Бесплатный
                </Badge>
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
              <Link href="/login" className={linkBase}>
                Войти
              </Link>
              <Link href="/signup" className={cn(linkBase, "bg-primary text-primary-foreground hover:bg-primary/90")}>
                Регистрация
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
