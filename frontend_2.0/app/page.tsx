import { AddressCheckForm } from "@/components/address-check-form";
import { GuestChecksBadge } from "@/components/guest-checks-badge";
import { siteConfig } from "@/lib/data";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <section className="w-full border-b bg-card p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          <div className="px-6 py-16 sm:px-10 sm:py-20 lg:col-span-10 lg:col-start-2 lg:px-16">
            <div className="max-w-4xl">
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                {siteConfig.name}
              </h1>
              <p className="mt-3 max-w-xl text-base text-muted-foreground sm:text-lg">
                {siteConfig.tagline}
              </p>
              <p className="mt-1.5 max-w-lg text-sm text-foreground/80">
                {siteConfig.description}
              </p>

              <div className="mt-10 max-w-lg">
                <AddressCheckForm />
              </div>

              <div className="mt-6">
                <GuestChecksBadge />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full border-b bg-card p-4">
        <div className="grid grid-cols-1 px-6 py-16 sm:px-10 sm:py-20 lg:grid-cols-12">
          <div className="lg:col-span-8 lg:col-start-3">
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Проверка на соответствие 152-ФЗ
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Сервис анализирует сайт, запускает backend-проверки и формирует отчет с найденными нарушениями, предупреждениями и ссылками на страницы, где обнаружены риски.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
