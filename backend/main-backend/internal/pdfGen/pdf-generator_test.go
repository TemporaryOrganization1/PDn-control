package pdfGen

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/main-backend/internal/store"
)

func TestGeneratePDFReportWritesStyledFile(t *testing.T) {
	t.Setenv("PDF_FONT_DIR", ".")

	outputPath := filepath.Join(t.TempDir(), "report.pdf")
	if samplePath := os.Getenv("PDFGEN_SAMPLE_OUTPUT"); samplePath != "" {
		outputPath = samplePath
		if err := os.MkdirAll(filepath.Dir(outputPath), 0755); err != nil {
			t.Fatalf("create sample output directory: %v", err)
		}
	}

	err := GeneratePDFReport("https://example.ru", []store.Result{
		{
			ID:     "privacy-policy",
			Result: "fail",
			Pages:  []string{"https://example.ru/privacy"},
			About:  "Политика конфиденциальности не найдена на публичных страницах сайта.",
			Data: map[string]interface{}{
				"pages": []interface{}{"https://example.ru/privacy"},
			},
		},
		{
			ID:     "cookie-banner",
			Result: "warn",
			About:  "Cookie-баннер требует ручной проверки формулировок согласия.",
		},
		{
			ID:     "https",
			Result: "ok",
		},
	}, outputPath)
	if err != nil {
		t.Fatalf("GeneratePDFReport() error = %v", err)
	}

	info, err := os.Stat(outputPath)
	if err != nil {
		t.Fatalf("stat generated PDF: %v", err)
	}
	if info.Size() < 1000 {
		t.Fatalf("generated PDF is too small: %d bytes", info.Size())
	}
}
