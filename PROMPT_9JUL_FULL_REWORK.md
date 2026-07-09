# PDn Control: полный промпт на доведение результата, API, PDF и Docker

Ты работаешь в репозитории `PDn-control`. Твоя задача не переписать проект заново, а довести текущую систему до рабочего состояния по новому API crawler-worker, поправить плохо работающие места и сохранить дизайн-направление из `frontend/PDn_Control_Universal_UI_Blueprint.md`.

Перед началом внимательно прочитай:

- `PROMPT_9JUL.txt`;
- `frontend/PDn_Control_Universal_UI_Blueprint.md`;
- `README.md`;
- `docker-compose.yml`;
- `api/openapi.yaml`;
- весь код в `backend/crawler-worker`, `backend/main-backend`, `backend/geoip-service`, `frontend/app`, `frontend/components`, `frontend/lib`.

Работай до конца: реализация, тесты, сборка, Docker-проверка или ясное описание блокера.

## Главная цель

Сделать так, чтобы полный путь работал в Docker:

1. пользователь запускает проверку с frontend;
2. `main-backend` отправляет задачу в `crawler-worker`;
3. worker возвращает новый подробный JSON-отчет;
4. `main-backend` корректно сохраняет весь отчет, изображения, PDF и историю;
5. frontend показывает страницу результата с новыми данными;
6. PDF содержит новые данные и evidence;
7. при удалении/истечении отчета связанные PDF и изображения удаляются согласованно;
8. `docker-compose up --build` поднимает рабочий продукт.

## Важный найденный баг

Сейчас worker на финальном progress callback отправляет `data` не как массив, а как объект:

```json
{
  "checks": [
    {
      "id": "ssl/tls",
      "result": "ok",
      "data": {},
      "images": []
    }
  ],
  "screenshotId": "image-id-or-null",
  "ssl": {
    "issuer": "...",
    "validFrom": 1234567890,
    "validTo": 1234567890,
    "protocol": "...",
    "subjectName": "...",
    "subjectAlternativeNames": []
  },
  "about": "краткое описание сайта",
  "country": "ru"
}
```

А `backend/main-backend/internal/api/handlers.go::normalizeResults` сейчас ожидает, что `data` сразу `[]any`. Из-за этого финальные результаты могут не сохраняться. Исправь это первым делом.

## Новый контракт результата

Введи единый тип результата во всех слоях. Минимальный контракт:

```ts
type WorkerReportPayload = {
  checks: WorkerCheck[];
  screenshotId: string | null;
  ssl: SslInfo | null;
  about: string | null;
  country: string | null; // ISO alpha-2 lower/upper case, null, unknown
};

type WorkerCheck = {
  id: string;
  result: "ok" | "warn" | "fail";
  data?: Record<string, unknown>;
  pages?: string[];
  about?: string;
  images?: string[];
};

type SslInfo = {
  issuer: string;
  validFrom: number;
  validTo: number;
  protocol: string;
  subjectName: string;
  subjectAlternativeNames: string[];
};
```

Go-слой должен иметь аналогичные структуры. Не теряй неизвестные поля `data`.

## Backend: main-backend

Сделай:

1. Обнови `models.ProgressUpdate`, `store.Task`, `store.Result`, auth history и PDF save path так, чтобы они сохраняли:
   - `checks`;
   - `images` внутри каждой проверки;
   - `screenshotId`;
   - верхний `ssl`;
   - верхний `about`;
   - верхний `country`.
2. `normalizeResults` должен принимать оба формата для обратной совместимости:
   - старый `data: []`;
   - новый `data: { checks, screenshotId, ssl, about, country }`.
3. API `/api/progress/:reqId` должен возвращать frontend полный отчет, а не только старое `results`.
4. `/api/reports` должен возвращать историю с полным сохраненным payload, чтобы открытие старого отчета из профиля работало без потери screenshot/ssl/country/images.
5. Добавь или обнови endpoint удаления конкретного отчета, если его нет. При удалении отчета:
   - удалить запись `check_history`;
   - удалить связанный `pdf_reports`;
   - удалить PDF-файл с диска;
   - пометить/удалить связанные изображения по `req_id`;
   - не ломать удаление аккаунта.
6. Исправь cleanup free-user отчетов: когда истекает `check_history`, должен удаляться соответствующий PDF report record и PDF-файл, а также связанные images. Сейчас cleanup удаляет историю и images частично, но PDF может остаться.
7. Обеспечь привязку изображений к `check_history` после того, как history создана. Сейчас `SaveImage` пытается найти `check_history` в момент загрузки картинки, но картинки обычно приходят раньше сохранения истории. После `SaveCheckHistory` нужно связать изображения по `req_id` с созданным `check_history.id`.
8. Проверь секреты:
   - worker progress использует `X-Worker-Secret`;
   - image upload использует `X-Image-Secret`;
   - не раскрывать секреты frontend-у.
9. Обнови `api/openapi.yaml`:
   - полный `TaskState`;
   - `ReportPayload`;
   - `CheckResult.images`;
   - `/img/{id}`;
   - endpoint удаления отчета, если добавлен.

## Backend: crawler-worker

Проверь и при необходимости исправь:

1. `backend/crawler-worker/src/data.ts`: результат должен быть стабильным и типизированным.
2. `src/server.ts`: финальный callback должен отправлять весь `WorkerReportPayload`.
3. `src/checks/ssl.ts`: поля SSL должны соответствовать frontend/backend типам.
4. `src/checks/country.ts`: `country` должен быть ISO-кодом или `unknown/null`; не смешивать `localhost` с реальным ISO в UI без явной подписи.
5. `src/checks/screenshot.ts`: верхний screenshot должен сохраняться в `screenshotId`.
6. AI-check screenshots:
   - `images` в check должны быть ID изображений из `/api/img/upload`;
   - если screenshot selector не найден, проверка не должна падать целиком.
7. Убери очевидные баги, если встретишь. Например в `ai.ts` есть подозрительный catch с `error.name` вместо локальной ошибки.

Не меняй смысл юридических проверок без необходимости.

## Frontend: API и адаптер результата

Сделай:

1. Обнови `frontend/lib/api.ts`:
   - `BackendCheckResult.images?: string[]`;
   - верхние поля отчета в `TaskState`;
   - типы `ssl`, `screenshotId`, `country`, `about`.
2. Обнови `frontend/lib/data.ts` и `frontend/lib/result-adapter.ts`:
   - новый score считается по формуле ниже;
   - использовать верхний `about` как краткое описание сайта;
   - использовать check `about` как описание конкретной проверки;
   - SSL брать из верхнего `ssl`, а не заглушек;
   - country брать из верхнего `country`;
   - images прокидывать в карточки проверок;
   - screenshotId прокидывать в result page.
3. Старые отчеты без новых полей должны отображаться без падения.

## Новый scoring

Старый смысл “вероятность штрафа” заменить на “качество прохождения проверок”.

Формула:

```text
points = ok_count * 1 + warn_count * 0.5 + fail_count * 0
score = round(points / total_checks * 100)
```

Смысл:

- `100%` это хорошо;
- `0%` это плохо;
- зеленый/positive glow для высокого score;
- warning для среднего;
- danger для низкого.

Не показывай подпись “вероятность штрафа”. Используй тексты вроде:

- `Индекс прохождения проверок`;
- `чем выше, тем лучше`;
- `успешно пройдено с учетом предупреждений`.

Исторические поля можно переименовать аккуратно, но не ломай API без нужды. Если оставляешь `riskScore` ради совместимости, документируй, что это legacy или вычисляй отдельно.

## Возможные штрафы

Создай единый источник сумм штрафов, например:

- `backend/main-backend/internal/compliance/fines.json`;
- и/или `frontend/lib/fines.ts` генерируемый/дублируемый из JSON;
- лучше один JSON в репозитории и импорты/парсинг там, где нужно.

Данные:

```json
{
  "checks": [
    {
      "check_name": "Согласие на обработку ПДн",
      "check_ids": ["sep-consent"],
      "max_fine_rub": {
        "physical_person": 15000,
        "legal_entity": 700000
      }
    },
    {
      "check_name": "Политика конфиденциальности",
      "check_ids": ["privacy-policy"],
      "max_fine_rub": {
        "physical_person": 3000,
        "legal_entity": 60000
      }
    },
    {
      "check_name": "Контакты по персональным данным",
      "check_ids": ["email-pdn"],
      "max_fine_rub": {
        "physical_person": 4000,
        "legal_entity": 80000
      }
    },
    {
      "check_name": "География серверов",
      "check_ids": ["ips", "country"],
      "max_fine_rub": {
        "physical_person": 50000,
        "legal_entity": 18000000
      }
    },
    {
      "check_name": "Cookie-баннер",
      "check_ids": ["cookie-banner"],
      "max_fine_rub": {
        "physical_person": 15000,
        "legal_entity": 700000
      }
    },
    {
      "check_name": "foreign-words",
      "check_ids": ["foreign-words"],
      "max_fine_rub": {
        "physical_person": 2500,
        "legal_entity": 500000
      }
    },
    {
      "check_name": "Формы согласия",
      "check_ids": ["consent-forms", "forms"],
      "max_fine_rub": {
        "physical_person": 15000,
        "legal_entity": 700000
      }
    },
    {
      "check_name": "Маркировка рекламы",
      "check_ids": ["ad-marking"],
      "max_fine_rub": {
        "physical_person": 0,
        "legal_entity": 500000
      }
    },
    {
      "check_name": "Данные несовершеннолетних",
      "check_ids": ["minors-data"],
      "max_fine_rub": {
        "physical_person": 15000,
        "legal_entity": 700000
      }
    },
    {
      "check_name": "Специальные категории ПДн",
      "check_ids": ["special-categ"],
      "max_fine_rub": {
        "physical_person": 15000,
        "legal_entity": 700000
      }
    },
    {
      "check_name": "HTTPS соединения",
      "check_ids": ["https"],
      "max_fine_rub": {
        "physical_person": 500000,
        "legal_entity": 20000000
      }
    },
    {
      "check_name": "Cookie и сторонние трекеры",
      "check_ids": ["cookie-ads", "cookies"],
      "max_fine_rub": {
        "physical_person": 15000,
        "legal_entity": 700000
      }
    },
    {
      "check_name": "SSL/TLS сертификат",
      "check_ids": ["ssl/tls"],
      "max_fine_rub": {
        "physical_person": 500000,
        "legal_entity": 20000000
      }
    }
  ]
}
```

Расчет:

- считать “предположительную сумму” как сумму максимумов только по `failed` и `warning` проверкам;
- `fail` учитывается как 100% максимального штрафа;
- `warn` учитывается как 50% максимального штрафа;
- `ok` не добавляет штраф;
- показывать отдельно:
  - `Физическое лицо`;
  - `Юридическое лицо`;
  - подпись `первичная оценка возможного максимума, не юридическое заключение`.

Если найдешь в проекте более подходящую модель, используй ее, но сохрани централизованный источник данных.

## Frontend: result page

Страница результата должна показывать:

1. В самом верху screenshot сайта из `screenshotId`.
   - изображение не обязано быть на всю ширину;
   - открыть в fullscreen/lightbox по клику;
   - скачать изображение;
   - если screenshot отсутствует, показать спокойный empty state.
2. Header отчета:
   - URL;
   - дата;
   - report id;
   - тип проверки;
   - краткое описание сайта из верхнего `about`.
3. Новый score как индекс прохождения проверок.
4. Возможные штрафы отдельно для физлица и юрлица.
5. Блок “Информация о сайте”:
   - домены/IP;
   - `country`;
   - флаг страны.
6. Блок “География серверов”:
   - для каждого service из `ips.data.services`: domain, ip, country;
   - флаг около каждой страны.
7. Блок SSL:
   - issuer;
   - protocol;
   - subjectName;
   - subjectAlternativeNames;
   - validFrom;
   - validTo;
   - понятный статус истек/не истек.
8. Детальные карточки проверок:
   - label;
   - status text;
   - `about`;
   - pages/found URLs;
   - technical details;
   - attached images from `images`.
9. Для attached images:
   - thumbnail под соответствующей проверкой;
   - click opens fullscreen modal;
   - download button/link;
   - загрузка через `/api/img/{id}`.

Соблюдай дизайн из `frontend/PDn_Control_Universal_UI_Blueprint.md`:

- premium dark legal-tech;
- neutral surfaces;
- status colors only as glow;
- no blue primary;
- no loud red/yellow/green blocks;
- responsive mobile layout;
- focus states white/gray;
- lucide icons where useful.

## Флаги стран

Нужно добавить локальные флаги стран. Не тянуть изображения с внешнего CDN в runtime.

Обязательное решение: ИИ сам скачивает open-source набор флагов в проект. Пользователь не обязан предоставлять архив.

Приоритет:

1. Скачать open-source SVG набор во время разработки и сохранить локально в проекте. Подходящие варианты:
   - npm package `flag-icons`;
   - другой легкий SVG набор с лицензией, пригодной для проекта.
2. Формат URL желательно такой:
   - `/flags/ru.svg`;
   - `/flags/us.svg`;
   - ISO alpha-2 lower case.

Добавь helper:

```ts
countryCodeToFlagUrl(code: string | null | undefined): string | null
countryCodeToDisplayName(code: string | null | undefined): string
```

Для `null`, `unknown`, `localhost` показывать `Не определено` без сломанной картинки.

## PDF report

PDF сейчас генерируется в Go в `backend/main-backend/internal/pdfGen/pdf-generator.go`.

Обязательное решение: допустимо перенести PDF-генерацию или добавить новую генерацию через frontend/Node-библиотеку, если так проще красиво вставить screenshot и attached images. Главное условие: PDF должен быть привязан к report id, скачиваться через backend/API и удаляться вместе с отчетом. Не оставляй два конкурирующих PDF-пути без ясной причины.

Обнови PDF:

1. Новый score по формуле прохождения проверок.
2. Возможные штрафы отдельно:
   - физлицо;
   - юрлицо.
3. Верхний screenshot сайта, если доступен.
4. SSL block.
5. Site info: country и флаг/код страны. Если вставить SVG-флаг в PDF сложно, покажи ISO-код и название страны; не блокируй весь PDF из-за флага.
6. Attached images по проверкам:
   - вставить хотя бы первые N изображений с ограничением размера;
   - не падать, если файл отсутствует;
   - в PDF указать `image id`, если картинку нельзя вставить.
7. Check `about` и верхний `about`.
8. Technical details из `data`.

Если `gofpdf` не умеет удобно вставлять нужный формат, конвертируй/используй PNG/JPEG, но не добавляй тяжелый внешний сервис.

## Reports/history deletion

Добавь UX для удаления отчета из истории, если endpoint реализован:

- кнопка удаления в истории;
- confirmation dialog;
- после удаления отчет исчезает из списка;
- PDF-файл и связанные изображения удаляются/помечаются backend-ом.

Не путай это с удалением аккаунта.

## Tests

Обязательно добавить/обновить тесты:

### main-backend

- `normalizeResults` принимает новый object payload;
- `normalizeResults` сохраняет `images`, `pages`, `about`, `data`;
- сохранение history связывает изображения по `req_id`;
- SaveReport не создает дубликаты по `req_id`;
- cleanup удаляет/помечает связанные PDF/images;
- endpoint удаления отчета проверяет авторизацию.

### crawler-worker

- shape финального результата;
- screenshotId сохраняется;
- SSL data shape;
- country data shape;
- AI images сохраняются как IDs.

### frontend

- `taskToCheckResult` считает score:
  - ok=1;
  - warn=0.5;
  - fail=0;
  - round(points/total*100).
- `taskToCheckResult` берет верхние `ssl/about/country/screenshotId`;
- check images прокидываются в UI items;
- штрафы считаются из JSON;
- country flag helper работает для `ru`, `US`, `unknown`, `null`.

## Команды проверки

Запусти по возможности:

```bash
cd backend/crawler-worker
npm install
npm test
npm run typecheck
```

```bash
cd backend/main-backend
go test ./...
```

```bash
cd backend/geoip-service
go test ./...
```

```bash
cd frontend
npm install
npm run lint
npm run typecheck
npm test
npm run build
```

И финально:

```bash
docker-compose build
docker-compose up
```

Если Docker полностью запустить нельзя, минимум выполнить `docker-compose build` и описать точную причину, почему runtime не проверен.

## Документация

Обнови:

- `api/openapi.yaml`;
- `README.md`, если изменились команды/переменные/пути флагов;
- `docs/testing.md`, если изменились тестовые команды или покрытие;
- при необходимости `CHANGELOG.md`.

## Что не делать

- Не переписывать проект на другой стек.
- Не добавлять тяжелую UI-библиотеку.
- Не ломать auth/session/guest limits.
- Не удалять существующие пользовательские изменения без причины.
- Не делать frontend-only PDF вместо backend PDF без крайней необходимости.
- Не использовать внешний CDN для флагов или evidence images в runtime.
- Не обещать “точный штраф” или “100% юридическое соответствие”.

## Definition of Done

Работа готова, когда:

1. Новый worker payload корректно проходит через backend в frontend.
2. Results page показывает screenshot, about, SSL, country, flags, score, fines, check images.
3. PDF содержит новые данные и не падает на отсутствующих изображениях.
4. History/report deletion чистит связанные PDF/images.
5. OpenAPI описывает фактический контракт.
6. Все тесты и typecheck/build проходят либо есть честно описанные внешние блокеры.
7. `docker-compose build` проходит.
8. UI остается в стиле `PDn_Control_Universal_UI_Blueprint.md`.

## Зафиксированные решения пользователя

1. Флаги: ИИ сам скачивает open-source набор флагов в проект; пользовательский архив не нужен.
2. PDF: допустимо перенести или добавить генерацию через frontend/Node-библиотеку, если так проще красиво вставить изображения.
3. Штрафы: считать “предположительную сумму” как сумму максимумов только по `failed` и `warning` проверкам; `ok` проверки не добавляют штраф.
