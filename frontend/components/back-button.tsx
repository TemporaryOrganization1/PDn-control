"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  href?: string;
}

const className =
  "inline-flex items-center gap-1.5 rounded-lg text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30";

export function BackButton({ href }: BackButtonProps) {
  const router = useRouter();

  const content = (
    <>
      <ArrowLeft className="h-4 w-4" />
      Назад
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  const handleClick = () => {
    router.back();
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {content}
    </button>
  );
}
