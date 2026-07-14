package pdfGen

import (
	"encoding/json"
	"fmt"
	"math"
	"net/url"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/jung-kurt/gofpdf"
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/main-backend/internal/compliance"
	"github.com/stecenkoruslanigorevih31-web/PDn-control/backend/main-backend/internal/store"
)

type CheckInfo struct {
	PassLabel string
	FailLabel string
	Severity  string
	Art       string
}

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

type rgb struct {
	r int
	g int
	b int
}

var (
	pdfBg       = rgb{7, 9, 14}
	pdfSurface  = rgb{15, 18, 26}
	pdfElevated = rgb{21, 25, 35}
	pdfBorder   = rgb{48, 55, 70}
	pdfText     = rgb{238, 241, 245}
	pdfMuted    = rgb{157, 166, 180}
	pdfDim      = rgb{96, 106, 124}
	pdfDanger   = rgb{255, 88, 88}
	pdfWarning  = rgb{255, 205, 64}
	pdfSuccess  = rgb{47, 214, 139}
	pdfNeutral  = rgb{220, 225, 235}
)

const (
	pageW   = 210.0
	pageH   = 297.0
	marginX = 14.0
	usableW = 182.0
)

type reportDoc struct {
	pdf *gofpdf.Fpdf
	y   float64
}

type ReportOptions struct {
	ImagePaths map[string]string
}

type reportStats struct {
	total        int
	failed       int
	warnings     int
	passed       int
	violations   []store.Result
	passedChecks []store.Result
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

func calcComplianceScore(results []store.Result) int {
	if len(results) == 0 {
		return 0
	}
	points := 0.0
	for _, r := range results {
		switch r.Result {
		case "ok":
			points += 1
		case "warn":
			points += 0.5
		}
	}
	return int(math.Round(points / float64(len(results)) * 100))
}

func GetHostname(rawURL string) string {
	if !strings.HasPrefix(rawURL, "http://") && !strings.HasPrefix(rawURL, "https://") {
		rawURL = "https://" + rawURL
	}
	u, err := url.Parse(rawURL)
	if err != nil {
		return rawURL
	}
	return u.Hostname()
}

func resolveFontDir() string {
	if fontDir := os.Getenv("PDF_FONT_DIR"); fontDir != "" {
		return fontDir
	}
	for _, dir := range []string{"/app", "./internal/pdfGen", "internal/pdfGen", "."} {
		if _, err := os.Stat(dir + "/DejaVuSans.ttf"); err == nil {
			return dir
		}
	}
	return "/app"
}

func setFill(pdf *gofpdf.Fpdf, c rgb) {
	pdf.SetFillColor(c.r, c.g, c.b)
}

func setDraw(pdf *gofpdf.Fpdf, c rgb) {
	pdf.SetDrawColor(c.r, c.g, c.b)
}

func setText(pdf *gofpdf.Fpdf, c rgb) {
	pdf.SetTextColor(c.r, c.g, c.b)
}

func roundedRect(pdf *gofpdf.Fpdf, x, y, w, h, r float64, style string) {
	pdf.RoundedRect(x, y, w, h, r, "1234", style)
}

func toneForResult(result string) (rgb, string) {
	switch result {
	case "fail":
		return pdfDanger, "Нарушение"
	case "warn":
		return pdfWarning, "Предупреждение"
	default:
		return pdfSuccess, "Пройдено"
	}
}

func riskTone(risk int) (rgb, string) {
	if risk >= 60 {
		return pdfDanger, "Высокий риск"
	}
	if risk > 0 {
		return pdfWarning, "Есть риск"
	}
	return pdfSuccess, "Низкий риск"
}

func scoreTone(score int) (rgb, string) {
	if score >= 80 {
		return pdfSuccess, "Высокий индекс"
	}
	if score >= 50 {
		return pdfWarning, "Средний индекс"
	}
	return pdfDanger, "Низкий индекс"
}

func summarize(results []store.Result) reportStats {
	stats := reportStats{total: len(results)}
	for _, r := range results {
		switch r.Result {
		case "fail":
			stats.failed++
			stats.violations = append(stats.violations, r)
		case "warn":
			stats.warnings++
			stats.violations = append(stats.violations, r)
		default:
			stats.passed++
			stats.passedChecks = append(stats.passedChecks, r)
		}
	}
	return stats
}

func (d *reportDoc) addPage() {
	d.pdf.AddPage()
	d.drawPageChrome()
	d.y = 18
}

func (d *reportDoc) ensureSpace(height float64) {
	if d.y+height > 280 {
		d.addPage()
	}
}

func (d *reportDoc) drawPageChrome() {
	pdf := d.pdf
	setFill(pdf, pdfBg)
	pdf.Rect(0, 0, pageW, pageH, "F")

	setDraw(pdf, rgb{18, 22, 33})
	pdf.SetLineWidth(0.12)
	for x := 0.0; x <= pageW; x += 18 {
		pdf.Line(x, 0, x, pageH)
	}
	for y := 0.0; y <= pageH; y += 18 {
		pdf.Line(0, y, pageW, y)
	}

	setFill(pdf, rgb{18, 22, 32})
	pdf.Rect(0, 0, pageW, 34, "F")
	setFill(pdf, rgb{36, 41, 54})
	pdf.Rect(40, 0, 130, 1.1, "F")

	setFont(pdf, "", 7.5)
	setText(pdf, pdfDim)
	pdf.SetXY(marginX, 286)
	pdf.CellFormat(0, 4, fmt.Sprintf("PDn Control / compliance evidence / page %d", pdf.PageNo()), "", 0, "L", false, 0, "")
}

func setFont(pdf *gofpdf.Fpdf, style string, size float64) {
	pdf.SetFont("DejaVu", style, size)
}

func (d *reportDoc) roundedPanel(x, y, w, h float64) {
	pdf := d.pdf
	setFill(pdf, pdfSurface)
	roundedRect(pdf, x, y, w, h, 4, "F")
	setDraw(pdf, pdfBorder)
	pdf.SetLineWidth(0.22)
	roundedRect(pdf, x, y, w, h, 4, "D")
	setFill(pdf, rgb{48, 54, 68})
	roundedRect(pdf, x+7, y+0.8, w-14, 0.9, 0.4, "F")
}

func (d *reportDoc) statusPill(x, y float64, label string, accent rgb) float64 {
	pdf := d.pdf
	setFont(pdf, "", 7.5)
	w := pdf.GetStringWidth(label) + 13
	setFill(pdf, pdfElevated)
	setDraw(pdf, rgb{58, 65, 80})
	roundedRect(pdf, x, y, w, 6.4, 3.2, "FD")
	setFill(pdf, accent)
	pdf.Circle(x+4, y+3.2, 0.9, "F")
	setText(pdf, pdfNeutral)
	pdf.SetXY(x+7, y+1.3)
	pdf.CellFormat(w-8, 3.6, label, "", 0, "L", false, 0, "")
	return w
}

func (d *reportDoc) drawHero(targetURL string, hostname string, stats reportStats, complianceScore int, payload store.ReportPayload) {
	pdf := d.pdf
	accent, scoreLabel := scoreTone(complianceScore)

	x := marginX
	y := d.y

	heroCopy := "Индекс прохождения проверок, возможные штрафы и техническое evidence по результатам backend-проверки."
	if strings.TrimSpace(payload.About) != "" {
		heroCopy = payload.About
	}

	setFont(pdf, "", 9.5)
	wrappedLines := pdf.SplitLines([]byte(heroCopy), 108)
	copyHeight := float64(len(wrappedLines)) * 4.8

	h := 39.0 + copyHeight + 14.0
	if h < 64.0 {
		h = 64.0
	}

	d.ensureSpace(h + 8)
	y = d.y

	d.roundedPanel(x, y, usableW, h)

	setFill(pdf, rgb{28, 33, 45})
	roundedRect(pdf, x+5, y+5, 16, 16, 4, "F")
	setDraw(pdf, rgb{75, 82, 96})
	roundedRect(pdf, x+5, y+5, 16, 16, 4, "D")
	setText(pdf, pdfText)
	setFont(pdf, "B", 9)
	pdf.SetXY(x+8.2, y+10.4)
	pdf.CellFormat(10, 4, "PDn", "", 0, "C", false, 0, "")

	d.statusPill(x+26, y+6, "Enterprise compliance report", pdfNeutral)
	d.statusPill(x+116, y+6, scoreLabel, accent)

	setText(pdf, pdfText)
	setFont(pdf, "B", 22)
	pdf.SetXY(x+6, y+26)
	pdf.CellFormat(112, 9, "Отчет о проверке сайта", "", 0, "L", false, 0, "")

	setText(pdf, pdfMuted)
	setFont(pdf, "", 9.5)
	pdf.SetXY(x+6, y+39)
	pdf.MultiCell(108, 4.8, heroCopy, "", "L", false)

	cardH := h - 34.0
	if cardH < 30.0 {
		cardH = 30.0
	}

	setFill(pdf, rgb{10, 12, 18})
	setDraw(pdf, rgb{58, 65, 80})
	roundedRect(pdf, x+118, y+22, 58, cardH, 4, "FD")

	setText(pdf, pdfDim)
	setFont(pdf, "", 7.2)
	pdf.SetXY(x+123, y+27)
	pdf.CellFormat(0, 4, "Проверенный сайт", "", 0, "L", false, 0, "")

	setText(pdf, pdfText)
	setFont(pdf, "B", 10)
	pdf.SetXY(x+123, y+33)
	pdf.CellFormat(48, 5, hostname, "", 0, "L", false, 0, "")

	setText(pdf, pdfDim)
	setFont(pdf, "", 7.2)
	pdf.SetXY(x+123, y+41)
	pdf.CellFormat(48, 4, targetURL, "", 0, "L", false, 0, "")

	bottomY := y + h - 8.5

	setText(pdf, pdfDim)
	setFont(pdf, "", 7.2)
	pdf.SetXY(x+6, bottomY)
	pdf.CellFormat(0, 4, fmt.Sprintf("Дата формирования: %s", time.Now().Format("02.01.2006 15:04")), "", 0, "L", false, 0, "")

	pdf.SetXY(x+120, bottomY)
	pdf.CellFormat(0, 4, fmt.Sprintf("Индекс: %d/100 / проверок: %d", complianceScore, stats.total), "", 0, "L", false, 0, "")

	d.y += h + 8
}

func (d *reportDoc) drawMetricCard(x, y, w float64, label, value, caption string, accent rgb) {
	pdf := d.pdf

	cardHeight := 35.0
	setFill(pdf, pdfSurface)
	setDraw(pdf, pdfBorder)
	roundedRect(pdf, x, y, w, cardHeight, 4, "FD")

	setFill(pdf, accent)
	roundedRect(pdf, x+5, y+5, 1.4, cardHeight-10, 0.6, "F")

	setText(pdf, pdfDim)
	setFont(pdf, "", 5)
	pdf.SetXY(x+10, y+5.5)
	pdf.CellFormat(w-14, 4, label, "", 0, "L", false, 0, "")

	setText(pdf, pdfText)
	fontSize := 9.0
	setFont(pdf, "B", fontSize)
	maxWidth := w - 14

	for pdf.GetStringWidth(value) > maxWidth && fontSize > 6.0 {
		fontSize -= 0.5
		setFont(pdf, "B", fontSize)
	}

	pdf.SetXY(x+10, y+14)
	pdf.CellFormat(maxWidth, 7, value, "", 0, "L", false, 0, "")

	setText(pdf, pdfMuted)
	setFont(pdf, "", 5)
	pdf.SetXY(x+10, y+25)
	pdf.CellFormat(w-14, 4, caption, "", 0, "L", false, 0, "")
}

func rubLabel(value int) string {
	if value <= 0 {
		return "—"
	}
	raw := fmt.Sprintf("%d", value)
	parts := []string{}
	for len(raw) > 3 {
		parts = append([]string{raw[len(raw)-3:]}, parts...)
		raw = raw[:len(raw)-3]
	}
	parts = append([]string{raw}, parts...)
	return strings.Join(parts, " ") + " ₽"
}

func (d *reportDoc) drawSummary(stats reportStats, complianceScore int, estimate compliance.FineEstimate) {
	d.ensureSpace(35 + 7)

	scoreAccent, scoreLabel := scoreTone(complianceScore)
	y := d.y
	gap := 3.0
	w := (usableW - gap*3) / 4

	d.drawMetricCard(marginX, y, w, "Индекс прохождения", fmt.Sprintf("%d/100", complianceScore), "чем выше, тем лучше", scoreAccent)
	d.drawMetricCard(marginX+w+gap, y, w, "Физическое лицо", rubLabel(estimate.PhysicalPerson), "возможный максимум", pdfWarning)
	d.drawMetricCard(marginX+(w+gap)*2, y, w, "Юридическое лицо", rubLabel(estimate.LegalEntity), "возможный максимум", pdfWarning)
	d.drawMetricCard(marginX+(w+gap)*3, y, w, "Результат", scoreLabel, fmt.Sprintf("fail %d / warn %d", stats.failed, stats.warnings), scoreAccent)

	d.y += 42
}

func (d *reportDoc) drawExecutiveSummary(stats reportStats, complianceScore int) {
	pdf := d.pdf
	accent, scoreLabel := scoreTone(complianceScore)
	h := 34.0
	d.ensureSpace(h + 8)
	x, y := marginX, d.y
	d.roundedPanel(x, y, usableW, h)
	setFill(pdf, accent)
	roundedRect(pdf, x+6, y+8, 1.5, h-16, 0.6, "F")

	title := "Критических нарушений не найдено"
	copy := "Проверка не выявила существенных рисков по переданным backend данным."
	if stats.failed > 0 {
		title = "Есть нарушения, требующие приоритета"
		copy = "Найдены нарушения или существенные риски. Рекомендуется закрыть их до повторной проверки и использования отчета в качестве evidence."
	} else if stats.warnings > 0 {
		title = "Есть предупреждения для ручной проверки"
		copy = "Найдены зоны, которые стоит проверить вручную и закрыть до повторной проверки."
	}

	d.statusPill(x+11, y+7, scoreLabel, accent)
	setText(pdf, pdfText)
	setFont(pdf, "B", 12)
	pdf.SetXY(x+11, y+16)
	pdf.CellFormat(0, 5, title, "", 0, "L", false, 0, "")
	setText(pdf, pdfMuted)
	setFont(pdf, "", 8.5)
	pdf.SetXY(x+11, y+23)
	pdf.MultiCell(160, 4.5, copy, "", "L", false)
	d.y += h + 9
}

func imageType(filePath string) string {
	switch strings.ToLower(filepath.Ext(filePath)) {
	case ".png":
		return "PNG"
	case ".jpg", ".jpeg":
		return "JPG"
	default:
		return ""
	}
}

func countryName(code string) string {
	switch strings.ToLower(strings.TrimSpace(code)) {
	case "ru":
		return "Россия"
	case "us":
		return "США"
	case "kz":
		return "Казахстан"
	case "by":
		return "Беларусь"
	case "de":
		return "Германия"
	case "nl":
		return "Нидерланды"
	case "fr":
		return "Франция"
	case "", "unknown", "localhost":
		return "Не определено"
	default:
		return strings.ToUpper(code)
	}
}

func formatUnixTime(value int64) string {
	if value <= 0 {
		return "Не определено"
	}
	ts := value
	if ts > 100000000000 {
		ts = ts / 1000
	}
	return time.Unix(ts, 0).UTC().Format("02.01.2006")
}

func (d *reportDoc) drawScreenshot(payload store.ReportPayload, options ReportOptions) {
	if payload.ScreenshotID == "" {
		d.sectionTitle("Скриншот сайта", "Worker не передал верхний screenshotId для этого отчета.")
		return
	}

	filePath := options.ImagePaths[payload.ScreenshotID]
	if filePath == "" {
		d.sectionTitle("Скриншот сайта", "Файл скриншота недоступен; сохранен только image id: "+payload.ScreenshotID)
		return
	}
	if _, err := os.Stat(filePath); err != nil {
		d.sectionTitle("Скриншот сайта", "Файл скриншота отсутствует; image id: "+payload.ScreenshotID)
		return
	}

	d.sectionTitle("Скриншот сайта", "Верхний screenshot из crawler-worker evidence.")

	info := d.pdf.RegisterImageOptions(filePath, gofpdf.ImageOptions{ImageType: imageType(filePath), ReadDpi: true})

	maxWidth := usableW - 12
	imgW := maxWidth
	imgH := 62.0

	if info != nil && info.Width() > 0 {
		aspect := info.Height() / info.Width()
		imgH = imgW * aspect
		if imgH > 95.0 {
			imgH = 95.0
			imgW = imgH / aspect
		}
	}

	blockHeight := imgH + 15.0
	d.ensureSpace(blockHeight + 8)
	x, y := marginX, d.y

	d.roundedPanel(x, y, usableW, blockHeight)

	offsetX := 6.0 + (maxWidth-imgW)/2.0

	opts := gofpdf.ImageOptions{ImageType: imageType(filePath), ReadDpi: true}
	d.pdf.ImageOptions(filePath, x+offsetX, y+7, imgW, imgH, false, opts, 0, "")

	setText(d.pdf, pdfDim)
	setFont(d.pdf, "", 7.2)
	d.pdf.SetXY(x+6, y+blockHeight-6.5)
	d.pdf.CellFormat(0, 4, "image id: "+payload.ScreenshotID, "", 0, "L", false, 0, "")

	d.y += blockHeight + 8
}

func (d *reportDoc) drawSiteInfo(payload store.ReportPayload) {
	country := countryName(payload.Country)
	code := strings.ToUpper(strings.TrimSpace(payload.Country))
	if code == "" || strings.EqualFold(code, "unknown") || strings.EqualFold(code, "localhost") {
		code = "—"
	}

	about := strings.TrimSpace(payload.About)
	if about == "" {
		about = "Краткое описание сайта не передано worker."
	}

	setFont(d.pdf, "", 8.2)
	textWidth := usableW - 14
	wrappedLines := d.pdf.SplitLines([]byte(about), textWidth)
	aboutHeight := float64(len(wrappedLines)) * 4.5

	paddingTop := 25.0
	paddingBottom := 8.0
	blockHeight := paddingTop + aboutHeight + paddingBottom

	if blockHeight < 40 {
		blockHeight = 40
	}

	d.ensureSpace(blockHeight + 8)
	x, y := marginX, d.y

	d.roundedPanel(x, y, usableW, blockHeight)

	setText(d.pdf, pdfText)
	setFont(d.pdf, "B", 11)
	d.pdf.SetXY(x+7, y+8)
	d.pdf.CellFormat(0, 5, "Информация о сайте", "", 0, "L", false, 0, "")

	setText(d.pdf, pdfMuted)
	setFont(d.pdf, "", 8.2)
	d.pdf.SetXY(x+7, y+18)
	d.pdf.CellFormat(0, 4.5, fmt.Sprintf("Страна: %s / ISO: %s", country, code), "", 0, "L", false, 0, "")

	d.pdf.SetXY(x+7, y+paddingTop)
	d.pdf.MultiCell(textWidth, 4.5, about, "", "L", false)

	d.y += blockHeight + 7
}

func (d *reportDoc) drawSSLBlock(info *store.SslInfo) {
	if info == nil {
		d.ensureSpace(54)
		x, y := marginX, d.y
		d.roundedPanel(x, y, usableW, 35)
		setText(d.pdf, pdfText)
		setFont(d.pdf, "B", 11)
		d.pdf.SetXY(x+7, y+8)
		d.pdf.CellFormat(0, 5, "SSL/TLS", "", 0, "L", false, 0, "")

		setText(d.pdf, pdfMuted)
		setFont(d.pdf, "", 8.2)
		d.pdf.SetXY(x+7, y+19)
		d.pdf.CellFormat(0, 4.5, "Worker не передал upper SSL-блок.", "", 0, "L", false, 0, "")
		d.y += 45
		return
	}

	status := "не истек"
	if info.ValidTo > 0 {
		ts := info.ValidTo
		if ts > 100000000000 {
			ts = ts / 1000
		}
		if time.Unix(ts, 0).Before(time.Now()) {
			status = "истек"
		}
	}

	lines := []string{
		"issuer: " + emptyDash(info.Issuer),
		"protocol: " + emptyDash(info.Protocol),
		"subjectName: " + emptyDash(info.SubjectName),
		"validFrom: " + formatUnixTime(info.ValidFrom),
		"validTo: " + formatUnixTime(info.ValidTo) + " (" + status + ")",
		"SAN: " + emptyDash(strings.Join(info.SubjectAlternativeNames, ", ")),
	}

	setFont(d.pdf, "", 8.2)
	textWidth := usableW - 14

	totalLinesCount := 0
	for _, line := range lines {
		wrappedLines := d.pdf.SplitLines([]byte(line), textWidth)
		totalLinesCount += len(wrappedLines)
	}

	totalTextHeight := float64(totalLinesCount) * 4.2
	paddingTop := 18.0
	paddingBottom := 8.0
	blockHeight := paddingTop + totalTextHeight + paddingBottom

	d.ensureSpace(blockHeight + 10)
	x, y := marginX, d.y

	d.roundedPanel(x, y, usableW, blockHeight)

	setText(d.pdf, pdfText)
	setFont(d.pdf, "B", 11)
	d.pdf.SetXY(x+7, y+8)
	d.pdf.CellFormat(0, 5, "SSL/TLS", "", 0, "L", false, 0, "")

	setText(d.pdf, pdfMuted)
	setFont(d.pdf, "", 8.2)
	d.pdf.SetXY(x+7, y+paddingTop)
	d.pdf.MultiCell(textWidth, 4.2, strings.Join(lines, "\n"), "", "L", false)

	d.y += blockHeight + 6
}

func emptyDash(value string) string {
	if strings.TrimSpace(value) == "" {
		return "—"
	}
	return value
}

func (d *reportDoc) drawImageEvidence(title string, imageIDs []string, options ReportOptions) {
	if len(imageIDs) == 0 {
		return
	}
	d.sectionTitle("Фото-доказательство: "+title, "Прикрепленные изображения из /api/img/upload. Если файл недоступен, ниже указан image id.")
	for index, imageID := range imageIDs {
		if index >= 4 {
			d.ensureSpace(9)
			setText(d.pdf, pdfDim)
			setFont(d.pdf, "", 7.2)
			d.pdf.SetXY(marginX, d.y)
			d.pdf.CellFormat(0, 4, fmt.Sprintf("Еще изображений: %d", len(imageIDs)-index), "", 0, "L", false, 0, "")
			d.y += 8
			return
		}
		filePath := options.ImagePaths[imageID]
		if filePath == "" {
			d.ensureSpace(18)
			blockH := d.detailBlock(marginX, d.y, usableW, "image id: "+imageID+" (файл не найден)")
			d.y += blockH + 4
			continue
		}
		if _, err := os.Stat(filePath); err != nil {
			d.ensureSpace(18)
			blockH := d.detailBlock(marginX, d.y, usableW, "image id: "+imageID+" (файл отсутствует на диске)")
			d.y += blockH + 4
			continue
		}

		info := d.pdf.RegisterImageOptions(filePath, gofpdf.ImageOptions{ImageType: imageType(filePath), ReadDpi: true})

		imgW := 75.0
		imgH := 45.0

		if info != nil && info.Width() > 0 {
			aspect := info.Height() / info.Width()
			imgH = imgW * aspect

			if imgH > 110.0 {
				imgH = 110.0
				imgW = imgH / aspect
			}
		}

		blockHeight := imgH + 14.0
		if blockHeight < 60 {
			blockHeight = 60
		}

		d.ensureSpace(blockHeight + 8)
		x, y := marginX, d.y
		d.roundedPanel(x, y, usableW, blockHeight)

		opts := gofpdf.ImageOptions{ImageType: imageType(filePath), ReadDpi: true}
		d.pdf.ImageOptions(filePath, x+6, y+7, imgW, imgH, false, opts, 0, "")

		setText(d.pdf, pdfDim)
		setFont(d.pdf, "", 7.2)

		textX := x + imgW + 12.0
		textWidth := usableW - (imgW + 18.0)

		d.pdf.SetXY(textX, y+14)
		d.pdf.MultiCell(textWidth, 4.2, "image id: "+imageID, "", "L", false)

		d.y += blockHeight + 8
	}
}

func (d *reportDoc) sectionTitle(title, subtitle string) {
	pdf := d.pdf
	d.ensureSpace(20)
	setText(pdf, pdfText)
	setFont(pdf, "B", 14)
	pdf.SetXY(marginX, d.y)
	pdf.CellFormat(0, 7, title, "", 0, "L", false, 0, "")
	d.y += 8
	if subtitle != "" {
		setText(pdf, pdfMuted)
		setFont(pdf, "", 8.4)
		pdf.SetXY(marginX, d.y)
		pdf.MultiCell(usableW, 4.3, subtitle, "", "L", false)
		d.y = pdf.GetY() + 3
	}
}

func textHeight(pdf *gofpdf.Fpdf, text string, width float64, lineH float64) float64 {
	if strings.TrimSpace(text) == "" {
		return 0
	}
	lines := pdf.SplitLines([]byte(text), width)
	if len(lines) == 0 {
		return lineH
	}
	return float64(len(lines)) * lineH
}

func collectDataDetails(id string, data map[string]interface{}) []string {
	if len(data) == 0 {
		return nil
	}

	var details []string
	switch id {
	case "https", "cookie-ads":
		if endpoints, ok := data["endpoints"].([]interface{}); ok {
			label := "HTTP-эндпоинт"
			if id == "cookie-ads" {
				label = "Сторонний трекер"
			}
			for _, ep := range endpoints {
				if s, ok := ep.(string); ok {
					details = append(details, fmt.Sprintf("%s: %s", label, s))
				}
			}
		}
	case "ssl/tls":
		if endpoints, ok := data["endpoints"].(map[string]interface{}); ok {
			keys := sortedKeys(endpoints)
			for _, domain := range keys {
				statusStr := fmt.Sprintf("%v", endpoints[domain])
				if statusStr == "self-signed" {
					statusStr = "самоподписанный сертификат"
				}
				details = append(details, fmt.Sprintf("%s: %s", domain, statusStr))
			}
		}
	case "ips":
		if services, ok := data["services"].([]interface{}); ok {
			for _, svcInt := range services {
				svc, ok := svcInt.(map[string]interface{})
				if !ok {
					continue
				}
				domain := fmt.Sprintf("%v", svc["domain"])
				ips, _ := svc["ip"].([]interface{})
				countries, _ := svc["country"].([]interface{})
				if len(ips) == 0 {
					details = append(details, domain)
					continue
				}
				for i := 0; i < len(ips); i++ {
					country := "неизвестно"
					if i < len(countries) {
						country = fmt.Sprintf("%v", countries[i])
					}
					details = append(details, fmt.Sprintf("%s: %v — %s", domain, ips[i], country))
				}
			}
		}
	}

	if len(details) > 0 {
		return details
	}

	keys := sortedKeys(data)
	for _, key := range keys {
		if key == "pages" || key == "about" {
			continue
		}
		details = append(details, fmt.Sprintf("%s: %s", key, formatDetailValue(data[key])))
	}
	return details
}

func sortedKeys(m map[string]interface{}) []string {
	keys := make([]string, 0, len(m))
	for key := range m {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	return keys
}

func formatDetailValue(value interface{}) string {
	switch val := value.(type) {
	case []interface{}:
		parts := make([]string, 0, len(val))
		for _, item := range val {
			parts = append(parts, formatDetailValue(item))
		}
		return strings.Join(parts, ", ")
	case map[string]interface{}:
		b, _ := json.Marshal(val)
		return string(b)
	default:
		return fmt.Sprintf("%v", val)
	}
}

func limitEvidenceDetails(details []string) []string {
	const maxItems = 10
	const maxRunes = 420

	limited := details
	if len(details) > maxItems {
		limited = append([]string{}, details[:maxItems]...)
		limited = append(limited, fmt.Sprintf("Еще %d evidence-записей доступны в backend-данных проверки.", len(details)-maxItems))
	}

	for i, detail := range limited {
		runes := []rune(detail)
		if len(runes) > maxRunes {
			limited[i] = string(runes[:maxRunes]) + "..."
		}
	}
	return limited
}

func (d *reportDoc) detailBlock(x, y, w float64, text string) float64 {
	pdf := d.pdf
	setFont(pdf, "", 7.7)
	h := textHeight(pdf, text, w-8, 4) + 5
	setFill(pdf, rgb{9, 11, 17})
	setDraw(pdf, rgb{43, 50, 64})
	roundedRect(pdf, x, y, w, h, 2.6, "FD")
	setText(pdf, pdfNeutral)
	pdf.SetXY(x+4, y+2.5)
	pdf.MultiCell(w-8, 4, text, "", "L", false)
	return h
}

func (d *reportDoc) drawFinding(item store.Result) {
	pdf := d.pdf
	info := getCheckInfo(item.ID, item.Result)
	accent, statusLabel := toneForResult(item.Result)
	title := info.FailLabel
	if item.Result != "fail" && item.Result != "warn" {
		title = info.PassLabel
	}
	about := strings.TrimSpace(item.About)
	if about == "<nil>" {
		about = ""
	}

	var details []string
	if len(item.Pages) > 0 {
		for _, page := range item.Pages {
			details = append(details, "Затронутая страница: "+page)
		}
	}
	if dataMap, ok := item.Data.(map[string]interface{}); ok {
		details = append(details, collectDataDetails(item.ID, dataMap)...)
	}
	details = limitEvidenceDetails(details)

	setFont(pdf, "B", 10.5)
	titleH := textHeight(pdf, title, 136, 5.2)
	setFont(pdf, "", 8.2)
	aboutH := textHeight(pdf, about, 156, 4.4)
	detailsH := 0.0
	for _, detail := range details {
		setFont(pdf, "", 7.7)
		detailsH += textHeight(pdf, detail, 158, 4) + 8
	}
	h := 24 + titleH + aboutH + detailsH
	if about != "" {
		h += 3
	}
	if len(details) > 0 {
		h += 6
	}
	if h < 42 {
		h = 42
	}
	d.ensureSpace(h + 6)

	x, y := marginX, d.y
	d.roundedPanel(x, y, usableW, h)
	setFill(pdf, accent)
	roundedRect(pdf, x+6, y+7, 1.5, h-14, 0.6, "F")
	d.statusPill(x+12, y+7, statusLabel, accent)
	d.statusPill(x+12+pdf.GetStringWidth(statusLabel)+17, y+7, info.Severity, pdfNeutral)

	setText(pdf, pdfDim)
	setFont(pdf, "", 7.4)
	pdf.SetXY(x+126, y+8.1)
	pdf.CellFormat(48, 4, info.Art, "", 0, "R", false, 0, "")

	setText(pdf, pdfText)
	setFont(pdf, "B", 10.5)
	pdf.SetXY(x+12, y+17)
	pdf.MultiCell(156, 5.2, title, "", "L", false)
	currentY := pdf.GetY()

	if about != "" {
		setText(pdf, pdfMuted)
		setFont(pdf, "", 8.2)
		pdf.SetXY(x+12, currentY+2)
		pdf.MultiCell(156, 4.4, about, "", "L", false)
		currentY = pdf.GetY()
	}

	if len(details) > 0 {
		setText(pdf, pdfDim)
		setFont(pdf, "", 7.2)
		pdf.SetXY(x+12, currentY+4)
		pdf.CellFormat(0, 4, "Technical evidence", "", 0, "L", false, 0, "")
		currentY += 9
		for _, detail := range details {
			blockH := d.detailBlock(x+12, currentY, 158, detail)
			currentY += blockH + 3
		}
	}

	d.y += h + 6
}

func (d *reportDoc) drawPassedChecks(items []store.Result) {
	if len(items) == 0 {
		return
	}
	d.sectionTitle("Пройденные проверки", "Нейтральный список проверок, где backend не передал нарушений.")
	for _, item := range items {
		pdf := d.pdf
		info := getCheckInfo(item.ID, item.Result)
		d.ensureSpace(13)
		x, y := marginX, d.y
		setFill(pdf, pdfSurface)
		setDraw(pdf, rgb{42, 49, 62})
		roundedRect(pdf, x, y, usableW, 10, 2.8, "FD")
		setFill(pdf, pdfSuccess)
		pdf.Circle(x+6, y+5, 0.9, "F")
		setText(pdf, pdfDim)
		setFont(pdf, "", 7.4)
		pdf.SetXY(x+11, y+3.1)
		pdf.CellFormat(34, 4, info.Art, "", 0, "L", false, 0, "")
		setText(pdf, pdfText)
		setFont(pdf, "", 8.2)
		pdf.SetXY(x+46, y+2.9)
		pdf.CellFormat(126, 4.4, info.PassLabel, "", 0, "L", false, 0, "")
		d.y += 12
	}
}

// GeneratePDFReport creates a premium dark compliance PDF report from a normalized worker payload.
// It preserves the existing API and output path used by auth.Store.SaveReport.
func GeneratePDFReport(targetURL string, payload store.ReportPayload, outputPath string, opts ...ReportOptions) error {
	options := ReportOptions{}
	if len(opts) > 0 {
		options = opts[0]
	}
	if options.ImagePaths == nil {
		options.ImagePaths = map[string]string{}
	}
	results := payload.Checks
	pdf := gofpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(0, 0, 0)
	pdf.SetAutoPageBreak(false, 0)
	pdf.SetFontLocation(resolveFontDir())
	pdf.AddUTF8Font("DejaVu", "", "DejaVuSans.ttf")
	pdf.AddUTF8Font("DejaVu", "B", "DejaVuSans-Bold.ttf")
	setFont(pdf, "", 10)

	doc := &reportDoc{pdf: pdf}
	doc.addPage()

	hostname := GetHostname(targetURL)
	stats := summarize(results)
	complianceScore := calcComplianceScore(results)
	fineEstimate := compliance.Estimate(results)

	doc.drawHero(targetURL, hostname, stats, complianceScore, payload)
	doc.drawScreenshot(payload, options)
	doc.drawSummary(stats, complianceScore, fineEstimate)
	doc.drawExecutiveSummary(stats, complianceScore)
	doc.drawSiteInfo(payload)
	doc.drawSSLBlock(payload.SSL)

	if len(stats.violations) > 0 {
		doc.sectionTitle("Critical findings", "Нарушения и предупреждения сгруппированы как evidence-блоки. Цвет используется только как мягкий акцент, статус всегда подписан текстом.")
		for _, item := range stats.violations {
			doc.drawFinding(item)
			doc.drawImageEvidence(item.ID, item.Images, options)
		}
	}

	doc.drawPassedChecks(stats.passedChecks)

	if len(stats.violations) == 0 && len(stats.passedChecks) == 0 {
		doc.sectionTitle("Результаты проверки", "Backend завершил проверку, но не передал детальные результаты.")
	}

	return pdf.OutputFileAndClose(outputPath)
}
