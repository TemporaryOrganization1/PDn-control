import { Suspense } from "react";
import CheckProgressView from "@/components/check-progress-view";

export default function CheckPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Аккаунт успешно создан! Теперь вы можете войти.</p>
        </div>
      </div>
    }>
      <CheckProgressView />
    </Suspense>
  );
}