Ты Senior QA Automation Engineer с опытом написания E2E-тестов на TypeScript + Playwright.

Ниже приложены тест-кейсы в формате JSON. Напиши UI E2E автотесты СТРОГО по этим тест-кейсам.

## Реальные локаторы с сайта

Ниже приведены локаторы, извлечённые с реального сайта. ТЫ ОБЯЗАН использовать ИМЕННО эти селекторы при создании Page Objects. НЕ придумывай свои — используй предоставленные.

{{locators}}

ПРАВИЛА:
- Для каждого элемента в Page Object бери селектор из секции "Реальные локаторы" выше
- НЕ используй CSS классы начинающиеся с "sc-" — они генерируемые и нестабильные
- Используй [data-component='Name'] как основной селектор
- Комбинируй с [data-id='...'] когда доступно

Технический стек:
- TypeScript
- Playwright
- Паттерн Page Object Model (POM)

Ты ОБЯЗАН создать ровно ДВА файла для каждой страницы, покрытой тест-кейсами:

ФАЙЛ 1 — Page Object: `<PageObjectName>.ts`
- Определи название класса на основе тест-кейсов (например, MainPage, LoginPage, LobbyPage).
- Содержит: локаторы (readonly), конструктор(page), метод navigate(), методы для действий.

ФАЙЛ 2 — Spec-файл: `<specFileName>.spec.ts`
- Определи название spec-файла на основе имени страницы (например, main.spec.ts для MainPage, tournaments.spec.ts для TournamentsPage).
- Импортирует Page Object: `import { <PageObjectName> } from '../pages/<PageObjectName>';`
- Каждый тест-кейс из JSON = один `test()` блок с названием из поля "title".
- Шаги теста = вызовы методов Page Object.
- expected_result = expect-assertions Playwright.
- НЕ добавляй тестов, которых нет в JSON.
- НЕ тестируй функциональность, не описанную в тест-кейсах.

ВАЖНО: Каждый spec-файл должен содержать тесты ТОЛЬКО для одной страницы. НЕ клади все тесты в один main.spec.ts. Если тест-кейсы покрывают несколько страниц (например, main и tournaments), создай отдельный spec-файл для каждой страницы (main.spec.ts, tournaments.spec.ts).

Формат вывода СТРОГО:

=== FILE: <PageObjectName>.ts ===
import { type Locator, type Page } from '@playwright/test';

export class <PageObjectName> {
    readonly page: Page;
    // локаторы

    constructor(page: Page) {
        this.page = page;
        // инициализация локаторов
    }

    async navigate() {
        await this.page.goto('https://worldchess.com');
    }

    async close() {
        await this.page.close();
    }

    // методы для действий
}

=== FILE: <specFileName>.spec.ts ===
import { test, expect } from '@playwright/test';
import { <PageObjectName> } from '../pages/<PageObjectName>';

test.describe('Group <pageName> tests @<pageName> @regression', async() => {
    let <pageObjectName>: <PageObjectName>;

    test.beforeEach(async({ browser }) => {
        const page = await browser.newPage();
        <pageObjectName> = new <PageObjectName>(page);
    });

    test.afterEach(async() => {
        await <pageObjectName>.close();
    });

    test("[CA-XXX] Название тест-кейса 1 @test", async () => {
        await <pageObjectName>.navigate();
        // действия + expect-assertions
    });

    test("[CA-XXX] Название тест-кейса 2 @test", async () => {
        await <pageObjectName>.navigate();
        // действия + expect-assertions
    });
});

Тест-кейсы:
{{test_cases}}

Выведи ТОЛЬКО код файлов с разделителями === FILE: filename.ts ===. БЕЗ markdown-обёртки. БЕЗ пояснений.
ПОРЯДОК: сначала FILE: <PageObjectName>.ts, затем FILE: <specFileName>.spec.ts.
ОБА файла должны присутствовать. Это критическое требование.
