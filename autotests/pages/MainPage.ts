import { type Locator, type Page } from '@playwright/test';

export class MainPage {
    readonly page: Page;
    readonly registerButton: Locator;
    readonly tournamentsMenuLink: Locator;
    readonly lobbyMenuLink: Locator;
    readonly puzzlesMenuLink: Locator;
    readonly newsMenuLink: Locator;
    readonly masterclassesMenuLink: Locator;
    readonly playersMenuLink: Locator;
    readonly clubsMenuLink: Locator;
    readonly shopMenuLink: Locator;
    readonly accountPopupSignIn: Locator;
    readonly accountPopupRegister: Locator;
    readonly notificationsMarkAllRead: Locator;
    readonly newGameButton: Locator;
    readonly allMyGamesLink: Locator;
    readonly homeHeadEventFirst: Locator;
    readonly homeHeadEventSecond: Locator;
    readonly homeHeadEventThird: Locator;

    constructor(page: Page) {
        this.page = page;
        this.registerButton = page.locator("[data-component='Button']:has-text('Register for free')");
        this.tournamentsMenuLink = page.locator("[data-component='MenuItem'][data-id='tournaments']");
        this.lobbyMenuLink = page.locator("[data-component='MenuItem'][data-id='lobby']");
        this.puzzlesMenuLink = page.locator("[data-component='MenuItem'][data-id='puzzles']");
        this.newsMenuLink = page.locator("[data-component='MenuItem'][data-id='news']");
        this.masterclassesMenuLink = page.locator("[data-component='MenuItem'][data-id='masterclasses']");
        this.playersMenuLink = page.locator("[data-component='MenuItem'][data-id='players']");
        this.clubsMenuLink = page.locator("[data-component='MenuItem'][data-id='community']");
        this.shopMenuLink = page.locator("[data-component='MenuItem'][data-id='shop']");
        this.accountPopupSignIn = page.locator("[data-component='AccountPopupItem'][data-id='signIn']");
        this.accountPopupRegister = page.locator("[data-component='AccountPopupItem'][data-id='register']");
        this.notificationsMarkAllRead = page.locator("[data-component='Button']:has-text('Mark all as read')");
        this.newGameButton = page.locator("[data-component='Button']:has-text('New game')");
        this.allMyGamesLink = page.locator("[data-component='Link']:has-text('All my games')");
        this.homeHeadEventFirst = page.locator("[data-component='HomeHeadEventsItem']:has-text('What Does Viktor Orban'):first");
        this.homeHeadEventSecond = page.locator("[data-component='HomeHeadEventsItem']:has-text('The Election Chess Is Watching'):first");
        this.homeHeadEventThird = page.locator("[data-component='HomeHeadEventsItem']:has-text('World Chess Weekly'):first");
    }

    async navigate() {
        await this.page.goto('https://worldchess.com');
    }

    async close() {
        await this.page.close();
    }

    async clickRegisterButton() {
        await this.registerButton.click();
    }

    async clickTournamentsMenuLink() {
        await this.tournamentsMenuLink.click();
    }
}