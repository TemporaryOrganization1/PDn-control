import { Suspense } from "react";
import ResultView from "@/components/result-view";

export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Загрузка отчёта...</p>
        </div>
      </div>
    }>
      <ResultView />
    </Suspense>
  );
}