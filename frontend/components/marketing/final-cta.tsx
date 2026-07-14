import { AddressCheckForm } from "@/components/address-check-form";
import { SectionShell } from "@/components/marketing/section-shell";

export function FinalCTA() {
  return (
    <SectionShell contentClassName="max-w-5xl">
        <div className="text-center">
          <p className="text-sm font-medium text-foreground/72">Начать проверку</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl">
            Проверьте сайт до того, как риски станут проблемой
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            Введите адрес сайта и получите первичный отчет по рискам обработки персональных данных.
          </p>
          <div className="mx-auto mt-10 max-w-2xl">
            <AddressCheckForm />
          </div>
          <p className="mt-5 text-xs text-muted-foreground">
            Бесплатно: 3 проверки за 30 дней без регистрации
          </p>
        </div>
    </SectionShell>
  );
}
