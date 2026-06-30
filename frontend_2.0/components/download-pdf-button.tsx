"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import type { CheckResult } from "@/lib/data";
import { downloadReport } from "@/lib/api";

interface PdfDownloadButtonProps {
  result: CheckResult;
}

export function PdfDownloadButton({ result }: PdfDownloadButtonProps) {
  const [loading, setLoading] = useState(false);
  const disabled = !result.reportId || loading;

  const handleDownload = async () => {
    if (!result.reportId || loading) return;

    setLoading(true);
    try {
      await downloadReport(result.reportId);
      toast.success("PDF отчет скачивается");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не удалось скачать PDF");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="inline-flex items-center gap-2 border border-primary/30 bg-primary/10 px-5 py-2.5 text-sm font-medium text-primary transition-all hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
      onClick={handleDownload}
      disabled={disabled}
      title={result.reportId ? "Скачать PDF отчет" : "PDF появится после сохранения отчета backend"}
    >
      <Download className="h-4 w-4" />
      {loading ? "Скачиваем..." : "Скачать PDF отчет"}
    </button>
  );
}

