# WorldChess QA Agent

AI-агент для автоматизации QA-пайплайна WorldChess.

## Структура проекта

- `check-lists/` — входная папка для файлов чеклистов
- `prompts/` — промпты для LLM
- `results/` — результаты шагов: тест-кейсы, код-ревью, баг-репорты
- `autotests/` — сгенерированные Playwright-автотесты
- `src/agent.ts` — точка входа агента
- `src/openai.ts` — хелпер для вызова DeepSeek API

## Настройка

1. Установите зависимости:

```bash
npm install
```

2. Создайте файл `.env` на основе шаблона:

```bash
cp .env.example .env
```

3. Укажите ваш DeepSeek API ключ в `.env`:

```
DEEPSEEK_API_KEY=sk-...
```

## Запуск агента

```bash
npm run dev
```

## Как это работает

Агент выполняет следующие шаги:

1. Загружает файл чеклиста из `check-lists/`
2. Генерирует формальные тест-кейсы → `results/test_cases.json`
3. Создаёт TypeScript автотесты → `autotests/src/`
4. Запускает автотесты через Playwright
5. Делает код-ревью → `results/code_review.txt`
6. Генерирует баг-репорты → `results/bug_reports.json`

## GitHub Actions

Пайплайн запускается автоматически при push/PR в `main`/`master`, а также вручную через вкладку **Actions**.

Необходимо добавить секрет в репозиторий:
- **Settings** → **Secrets and variables** → **Actions** → **New repository secret**
- Name: `DEEPSEEK_API_KEY`
- Value: ваш DeepSeek API ключ

## Примечания

- Проект ожидает файл чеклиста в `check-lists/`
- Все вызовы LLM осуществляются через DeepSeek API (`deepseek-chat` модель)
- `.env` исключён из git — используйте `.env.example` как шаблон
