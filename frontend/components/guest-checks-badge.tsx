"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { getGuestRemaining, type GuestInfo } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

export function GuestChecksBadge() {
  const { isLoggedIn, isLoading } = useAuth();
  const [guest, setGuest] = useState<GuestInfo | null>(null);

  useEffect(() => {
    if (isLoading || isLoggedIn) {
      return;
    }

    let cancelled = false;
    getGuestRemaining()
      .then((nextGuest) => {
        if (!cancelled) setGuest(nextGuest);
      })
      .catch(() => {
        if (!cancelled) setGuest(null);
      });

    return () => {
      cancelled = true;
    };
  }, [isLoading, isLoggedIn]);

  if (isLoading) return null;

  if (isLoggedIn) {
    return (
      <Badge variant="secondary" className="px-3 py-1 text-sm text-muted-foreground">
        Проверки доступны без гостевого лимита
      </Badge>
    );
  }

  if (!guest) return null;

  return (
    <Badge variant="secondary" className="px-3 py-1 text-sm text-muted-foreground">
      Бесплатных проверок: {guest.remaining}/{guest.limit}
    </Badge>
  );
}
