"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { getUsage, type ScanQuota } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

export function GuestChecksBadge() {
  const { isLoading } = useAuth();
  const [guest, setGuest] = useState<ScanQuota | null>(null);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    let cancelled = false;
    getUsage()
      .then((nextGuest) => {
        if (!cancelled) setGuest(nextGuest);
      })
      .catch(() => {
        if (!cancelled) setGuest(null);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoading]);

  if (isLoading) return null;

  if (!guest) return null;

  if (!guest.limited) {
    return <span className="text-xs text-muted-foreground">Paid: проверки без лимита</span>;
  }

  return (
    <Badge variant="secondary" className="px-3 py-1 text-sm text-muted-foreground">
      Бесплатных проверок: {guest.remaining}/{guest.limit}
    </Badge>
  );
}
