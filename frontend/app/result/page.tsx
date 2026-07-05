import { Suspense } from "react";
import ResultView from "@/components/result-view";

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="dashboard-page flex h-screen items-center justify-center">
        <div className="dashboard-card flex flex-col items-center rounded-2xl px-10 py-8">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/15 border-t-white/80" />
          <p className="mt-4 text-sm text-muted-foreground">Загрузка отчёта...</p>
        </div>
      </div>
    }>
      <ResultView />
    </Suspense>
  );
}
