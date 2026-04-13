import { test, expect } from '@playwright/test';
import { GamePage } from '../pages/GamePage';

test.describe('Group GamePage tests @game @regression', async() => {
    let gamePage: GamePage;

    test.beforeEach(async({ browser }) => {
        const page = await browser.newPage();
        gamePage = new GamePage(page);
    });

    test.afterEach(async() => {
        await gamePage.close();
    });

    test("[CA-5] Проверка отображения элементов на странице партии для неавторизованного пользователя @test", async () => {
        await gamePage.navigate();
        const becomeProButton = gamePage.page.locator('button:has-text("Become pro")');
        const flipBoardButton = gamePage.page.locator('button:has-text("Flip board")');
        await expect(becomeProButton).toBeVisible();
        await expect(flipBoardButton).toBeVisible();
    });

    test("[CA-6] Проверка открытия попапа Become a pro со страницы партии @test", async () => {
        await gamePage.navigate();
        await gamePage.clickBecomeProButton();
        const becomeProPopup = gamePage.page.locator('text=Become a pro');
        await expect(becomeProPopup).toBeVisible();
    });

    test("[CA-7] Проверка действия кнопки Flip board на странице партии @test", async () => {
        await gamePage.navigate();
        const whitePlayerInitial = gamePage.whitePlayerLink;
        const blackPlayerInitial = gamePage.blackPlayerLink;
        await expect(whitePlayerInitial).toBeVisible();
        await expect(blackPlayerInitial).toBeVisible();
        await gamePage.clickFlipBoardButton();
        await expect(gamePage.page.locator('text=Ram divakar Cherla')).toBeVisible();
        await expect(gamePage.page.locator('text=Volha Lysiakova')).toBeVisible();
    });
});