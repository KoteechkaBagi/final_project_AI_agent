import { test, expect } from '@playwright/test';
import { TournamentsPage } from '../pages/TournamentsPage';

test.describe('Group TournamentsPage tests @tournaments @regression', async() => {
    let tournamentsPage: TournamentsPage;

    test.beforeEach(async({ browser }) => {
        const page = await browser.newPage();
        tournamentsPage = new TournamentsPage(page);
    });

    test.afterEach(async() => {
        await tournamentsPage.close();
    });

    test("[CA-4] Проверка отображения кнопки Join при клике на турнирную карточку @test", async () => {
        await tournamentsPage.navigate();
        await tournamentsPage.clickFirstTournamentCard();
        const joinButton = tournamentsPage.page.locator('button:has-text("Join")');
        await expect(joinButton).toBeVisible();
    });
});