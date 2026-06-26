package pdfGen

import (
	"encoding/json"
	"fmt"
	"net/url"
	"strings"
	"time"

	"github.com/jung-kurt/gofpdf"
)

// Result represents a single check result from the backend.
type Result struct {
	ID     string   `json:"id"`
	Result string   `json:"result"`
	Pages  []string `json:"pages,omitempty"`
	About  string   `json:"about,omitempty"`
	Data   any      `json:"data,omitempty"`
}

// CheckInfo holds the display metadata for a specific check ID.
type CheckInfo struct {
	PassLabel string
	FailLabel string
	Severity  string
	Art       string
}

// checkInfoMap mirrors the frontend CHECK_INFO object.
var checkInfoMap = map[string]CheckInfo{
	"https": {
		PassLabel: "HTTP-соединения не обнаружены",
		FailLabel: "Обнаружены незащищенные HTTP-соединения",
		Severity:  "Высокий",
		Art:       "HTTPS",
	},
	"ssl/tls": {
		PassLabel: "SSL/TLS-соединения настроены корректно",
		FailLabel: "SSL/TLS: небезопасное соединение",
		Severity:  "Критично",
		Art:       "SSL",
	},
	"ips": {
		PassLabel: "Серверы расположены в допустимых юрисдикциях",
		FailLabel: "Серверы за пределами РФ",
		Severity:  "Высокий",
		Art:       "Геолокация",
	},
	"cookie-ads": {
		PassLabel: "Сторонние трекеры и реклама не обнаружены",
		FailLabel: "Обнаружены сторонние трекеры или реклама",
		Severity:  "Средний",
		Art:       "Трекеры",
	},
	"sep-consent": {
		PassLabel: "Отдельное согласие на обработку ПД найдено",
		FailLabel: "Нет отдельного согласия на обработку ПД",
		Severity:  "Критично",
		Art:       "Ст. 9",
	},
	"foreign-words": {
		PassLabel: "Иностранные слова без перевода не обнаружены",
		FailLabel: "Использование иностранных слов без перевода",
		Severity:  "Низкий",
		Art:       "Язык",
	},
	"privacy-policy": {
		PassLabel: "Политика конфиденциальности найдена",
		FailLabel: "Политика конфиденциальности не найдена",
		Severity:  "Критично",
		Art:       "Политика",
	},
	"cookie-banner": {
		PassLabel: "Cookie-баннер согласия найден",
		FailLabel: "Отсутствует корректный cookie-баннер согласия",
		Severity:  "Средний",
		Art:       "Cookie",
	},
	"consent-forms": {
		PassLabel: "Формы согласия на обработку ПД найдены",
		FailLabel: "Нет форм согласия на обработку ПД",
		Severity:  "Высокий",
		Art:       "Формы",
	},
	"email-pdn": {
		PassLabel: "Email для запросов по ПД найден",
		FailLabel: "Нет email для запросов по ПД",
		Severity:  "Средний",
		Art:       "Контакты",
	},
	"ad-marking": {
		PassLabel: "Присутствует маркировка рекламы",
		FailLabel: "Отсутствует маркировка рекламы",
		Severity:  "Средний",
		Art:       "Реклама",
	},
	"minors-data": {
		PassLabel: "Нарушений по данным несовершеннолетних не обнаружено",
		FailLabel: "Проблемы с обработкой данных несовершеннолетних",
		Severity:  "Критично",
		Art:       "Дети",
	},
	"special-categ": {
		PassLabel: "Спецкатегории ПД не обрабатываются или оформлены корректно",
		FailLabel: "Проблемы с обработкой спецкатегорий ПД",
		Severity:  "Высокий",
		Art:       "Спецкатегории",
	},
	"forms": {
		PassLabel: "Формы сбора ПД оформлены корректно",
		FailLabel: "Формы сбора ПД без согласия",
		Severity:  "Высокий",
		Art:       "Формы",
	},
}

func getCheckInfo(id, result string) CheckInfo {
	info, ok := checkInfoMap[id]
	if !ok {
		return CheckInfo{
			PassLabel: id,
			FailLabel: id,
			Severity:  "Средний",
			Art:       id,
		}
	}
	return info
}

func calcRiskScore(results []Result) int {
	if len(results) == 0 {
		return 0
	}
	fails, warns := 0, 0
	for _, r := range results {
		if r.Result == "fail" {
			fails++
		} else if r.Result == "warn" {
			warns++
		}
	}
	score := 100 - (fails*25 + warns*10)
	if score < 0 {
		return 0
	}
	if score > 100 {
		return 100
	}
	return score
}

func getHostname(rawURL string) string {
	if !strings.HasPrefix(rawURL, "http://") && !strings.HasPrefix(rawURL, "https://") {
		rawURL = "https://" + rawURL
	}
	u, err := url.Parse(rawURL)
	if err != nil {
		return rawURL
	}
	return u.Hostname()
}

// drawDataDetails renders the specific data payload for a violation.
func drawDataDetails(pdf *gofpdf.Fpdf, id string, data map[string]interface{}) {
	pdf.SetFont("DejaVu", "", 9)
	pdf.SetTextColor(110, 110, 110)

	switch id {
	case "https", "cookie-ads":
		if endpoints, ok := data["endpoints"].([]interface{}); ok {
			label := "HTTP-эндпоинты:"
			if id == "cookie-ads" {
				label = "Сторонние трекеры:"
			}
			pdf.SetX(25)
			pdf.Cell(0, 5, label)
			pdf.Ln(5)
			pdf.SetTextColor(60, 60, 60)
			for _, ep := range endpoints {
				if s, ok := ep.(string); ok {
					if pdf.GetY() > 270 {
						pdf.AddPage()
					}
					pdf.SetX(30)
					pdf.Cell(5, 5, "—")
					pdf.MultiCell(0, 5, s, "", "", false)
				}
			}
			pdf.Ln(2)
		}
	case "ssl/tls":
		if endpoints, ok := data["endpoints"].(map[string]interface{}); ok {
			pdf.SetX(25)
			pdf.Cell(0, 5, "Небезопасные соединения:")
			pdf.Ln(5)
			pdf.SetTextColor(60, 60, 60)
			for domain, status := range endpoints {
				if pdf.GetY() > 270 {
					pdf.AddPage()
				}
				statusStr := fmt.Sprintf("%v", status)
				if statusStr == "self-signed" {
					statusStr = "самоподписанный сертификат"
				}
				pdf.SetX(30)
				pdf.Cell(5, 5, "—")
				pdf.MultiCell(0, 5, fmt.Sprintf("%s (%s)", domain, statusStr), "", "", false)
			}
			pdf.Ln(2)
		}
	case "ips":
		if services, ok := data["services"].([]interface{}); ok {
			pdf.SetX(25)
			pdf.Cell(0, 5, "Серверы за пределами РФ:")
			pdf.Ln(5)
			pdf.SetTextColor(60, 60, 60)
			for _, svcInt := range services {
				if svc, ok := svcInt.(map[string]interface{}); ok {
					if pdf.GetY() > 270 {
						pdf.AddPage()
					}
					domain := fmt.Sprintf("%v", svc["domain"])
					pdf.SetX(30)
					pdf.Cell(5, 5, "—")
					pdf.MultiCell(0, 5, domain, "", "", false)

					ips, _ := svc["ip"].([]interface{})
					countries, _ := svc["country"].([]interface{})
					for i := 0; i < len(ips); i++ {
						ip := fmt.Sprintf("%v", ips[i])
						country := "неизвестно"
						if i < len(countries) {
							country = fmt.Sprintf("%v", countries[i])
						}
						pdf.SetX(35)
						pdf.MultiCell(0, 5, fmt.Sprintf("%s — %s", ip, country), "", "", false)
					}
				}
			}
			pdf.Ln(2)
		}
	default:
		hasGeneric := false
		for k, v := range data {
			if k == "pages" || k == "about" {
				continue
			}
			if !hasGeneric {
				hasGeneric = true
			}
			pdf.SetTextColor(110, 110, 110)
			pdf.SetX(25)
			pdf.Cell(0, 5, fmt.Sprintf("%s:", k))
			pdf.Ln(5)
			pdf.SetTextColor(60, 60, 60)

			valStr := ""
			switch val := v.(type) {
			case []interface{}:
				var parts []string
				for _, item := range val {
					parts = append(parts, fmt.Sprintf("%v", item))
				}
				valStr = strings.Join(parts, ", ")
			case map[string]interface{}:
				b, _ := json.Marshal(val)
				valStr = string(b)
			default:
				valStr = fmt.Sprintf("%v", val)
			}

			if pdf.GetY() > 270 {
				pdf.AddPage()
			}
			pdf.SetX(30)
			pdf.MultiCell(0, 5, valStr, "", "", false)
		}
		if hasGeneric {
			pdf.Ln(2)
		}
	}
}

// GeneratePDFReport creates a professional PDF report from the check results.
// NOTE: This function requires DejaVuSans.ttf font file in the working directory
// to properly render Cyrillic characters.
func GeneratePDFReport(targetURL string, results []Result) error {
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(15, 15, 15)
	pdf.AddPage()

	// Add UTF-8 font for Cyrillic support
	// Make sure DejaVuSans.ttf is in your project directory
	pdf.AddUTF8Font("DejaVu", "", "DejaVuSans.ttf")
	pdf.AddUTF8Font("DejaVu", "B", "DejaVuSans-Bold.ttf")
	pdf.SetFont("DejaVu", "", 10)

	hostname := getHostname(targetURL)
	score := calcRiskScore(results)

	var violations, passed []Result
	for _, r := range results {
		if r.Result == "fail" || r.Result == "warn" {
			violations = append(violations, r)
		} else {
			passed = append(passed, r)
		}
	}

	// --- Header Section ---
	pdf.SetTextColor(40, 40, 40)
	pdf.SetFontSize(22)
	pdf.Cell(0, 12, "Отчет о проверке сайта")
	pdf.Ln(14)

	pdf.SetFontSize(14)
	pdf.SetTextColor(80, 80, 80)
	pdf.Cell(0, 8, hostname)
	pdf.Ln(10)

	pdf.SetDrawColor(220, 220, 220)
	pdf.Line(15, pdf.GetY(), 195, pdf.GetY())
	pdf.Ln(6)

	// Summary row
	pdf.SetFontSize(10)
	pdf.SetTextColor(110, 110, 110)
	pdf.Cell(40, 6, "Дата проверки:")
	pdf.SetTextColor(40, 40, 40)
	pdf.Cell(0, 6, time.Now().Format("02.01.2006"))
	pdf.Ln(6)

	pdf.SetTextColor(110, 110, 110)
	pdf.Cell(40, 6, "Всего проверок:")
	pdf.SetTextColor(40, 40, 40)
	pdf.Cell(0, 6, fmt.Sprintf("%d", len(results)))
	pdf.Ln(6)

	pdf.SetTextColor(110, 110, 110)
	pdf.Cell(40, 6, "Обнаружено нарушений:")
	pdf.SetTextColor(40, 40, 40)
	pdf.SetX(65) // Сдвигаем число вправо
	pdf.Cell(0, 6, fmt.Sprintf("%d", len(violations)))
	pdf.Ln(8)

	// Risk score
	riskLevel := "Низкий риск"
	riskColor := []int{60, 170, 60}
	if score <= 40 {
		riskLevel = "Высокий риск"
		riskColor = []int{210, 60, 60}
	} else if score <= 70 {
		riskLevel = "Средний риск"
		riskColor = []int{230, 140, 40}
	}

	pdf.SetTextColor(110, 110, 110)
	pdf.Cell(40, 6, "Уровень риска:")
	pdf.SetTextColor(riskColor[0], riskColor[1], riskColor[2])
	pdf.SetFont("DejaVu", "B", 10)
	pdf.Cell(30, 6, fmt.Sprintf("%d / 100", score))
	pdf.SetFont("DejaVu", "", 10)
	pdf.SetTextColor(110, 110, 110)
	pdf.Cell(0, 6, fmt.Sprintf("(%s)", riskLevel))
	pdf.Ln(12)

	// --- Violations Section ---
	if len(violations) > 0 {
		pdf.SetTextColor(40, 40, 40)
		pdf.SetFontSize(14)
		pdf.Cell(0, 10, "Обнаруженные нарушения")
		pdf.Ln(10)
		pdf.SetDrawColor(220, 220, 220)
		pdf.Line(15, pdf.GetY(), 195, pdf.GetY())
		pdf.Ln(6)

		drawViolation := func(v Result) {
			info := getCheckInfo(v.ID, v.Result)

			if pdf.GetY() > 240 {
				pdf.AddPage()
			}

			// Сдвигаем всё вправо
			pdf.SetX(20)

			// Top line with Art and Severity
			pdf.SetFont("DejaVu", "", 9)
			pdf.SetTextColor(110, 110, 110)
			pdf.Cell(35, 6, info.Art)

			var sevColor []int
			switch info.Severity {
			case "Критично":
				sevColor = []int{210, 60, 60}
			case "Высокий":
				sevColor = []int{230, 140, 40}
			case "Средний":
				sevColor = []int{60, 120, 210}
			default:
				sevColor = []int{140, 140, 140}
			}

			// Severity badge
			badgeW := pdf.GetStringWidth(info.Severity) + 8
			pdf.SetFillColor(sevColor[0], sevColor[1], sevColor[2])
			pdf.Rect(pdf.GetX(), pdf.GetY()+1, badgeW, 4, "F")
			pdf.SetTextColor(255, 255, 255)
			pdf.Cell(badgeW, 6, info.Severity)
			pdf.Ln(7)

			// Main label
			pdf.SetFont("DejaVu", "", 11)
			pdf.SetTextColor(40, 40, 40)
			pdf.SetX(25)
			pdf.MultiCell(0, 6, info.FailLabel, "", "", false)
			pdf.Ln(2)

			// About
			if v.About != "" && v.About != "<nil>" {
				pdf.SetFont("DejaVu", "", 9)
				pdf.SetTextColor(90, 90, 90)
				pdf.SetX(25)
				pdf.MultiCell(0, 5, v.About, "", "", false)
				pdf.Ln(3)
			}

			// Pages
			if len(v.Pages) > 0 {
				pdf.SetFont("DejaVu", "", 9)
				pdf.SetTextColor(110, 110, 110)
				pdf.SetX(25)
				pdf.Cell(0, 5, "Затронутые страницы:")
				pdf.Ln(5)
				pdf.SetTextColor(60, 60, 60)
				for _, page := range v.Pages {
					if pdf.GetY() > 270 {
						pdf.AddPage()
					}
					pdf.SetX(30)
					pdf.Cell(5, 5, "—")
					pdf.MultiCell(0, 5, page, "", "", false)
				}
				pdf.Ln(2)
			}

			// Data details
			if dataMap, ok := v.Data.(map[string]interface{}); ok {
				drawDataDetails(pdf, v.ID, dataMap)
			}

			pdf.Ln(3)
			pdf.SetDrawColor(235, 235, 235)
			pdf.Line(15, pdf.GetY(), 195, pdf.GetY())
			pdf.Ln(5)
		}

		for _, v := range violations {
			drawViolation(v)
		}
	}

	// --- Passed Section ---
	if len(passed) > 0 {
		if pdf.GetY() > 230 {
			pdf.AddPage()
		}

		pdf.SetTextColor(40, 40, 40)
		pdf.SetFontSize(14)
		pdf.Cell(0, 10, "Пройденные проверки")
		pdf.Ln(10)
		pdf.SetDrawColor(220, 220, 220)
		pdf.Line(15, pdf.GetY(), 195, pdf.GetY())
		pdf.Ln(6)

		pdf.SetFont("DejaVu", "", 10)
		for _, p := range passed {
			info := getCheckInfo(p.ID, p.Result)
			if pdf.GetY() > 270 {
				pdf.AddPage()
			}

			// Сдвигаем всё вправо
			pdf.SetX(20)

			pdf.SetTextColor(60, 170, 60)
			pdf.Cell(8, 6, "•")

			pdf.SetTextColor(110, 110, 110)
			pdf.Cell(35, 6, info.Art)

			pdf.SetTextColor(40, 40, 40)
			// Сдвигаем текст еще правее
			pdf.SetX(pdf.GetX() + 5)
			pdf.MultiCell(0, 6, info.PassLabel, "", "", false)
			pdf.Ln(2)
		}
	}

	return pdf.OutputFileAndClose("report.pdf")
}