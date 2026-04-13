import { test, expect } from '@playwright/test';
import { MainPage } from '../pages/MainPage';

test.describe('Group MainPage tests @main @regression', async() => {
    let mainPage: MainPage;

    test.beforeEach(async({ browser }) => {
        const page = await browser.newPage();
        mainPage = new MainPage(page);
    });

    test.afterEach(async() => {
        await mainPage.close();
    });

    test("[CA-1] Проверка загрузки главной страницы неавторизованным пользователем @test", async () => {
        await mainPage.navigate();
        await expect(mainPage.page).toHaveURL('https://worldchess.com/');
        await expect(mainPage.page).not.toHaveURL('about:blank');
    });

    test("[CA-2] Проверка открытия попапа регистрации с главной страницы @test", async () => {
        await mainPage.navigate();
        await mainPage.clickRegisterButton();
        const signUpPopup = mainPage.page.locator('text=Sign up');
        await expect(signUpPopup).toBeVisible();
    });

    test("[CA-3] Проверка перехода в раздел турниров через меню @test", async () => {
        await mainPage.navigate();
        await mainPage.clickTournamentsMenuLink();
        await expect(mainPage.page).toHaveURL(/.*tournaments/);
        const tournamentsTitle = mainPage.page.locator('text=Tournaments today');
        await expect(tournamentsTitle).toBeVisible();
    });
});