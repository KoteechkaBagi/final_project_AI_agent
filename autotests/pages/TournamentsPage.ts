import { type Locator, type Page } from '@playwright/test';

export class TournamentsPage {
    readonly page: Page;
    readonly registerButton: Locator;
    readonly tournamentsMenuLink: Locator;
    readonly tournamentsPageTitle: Locator;
    readonly tournamentsFilter: Locator;
    readonly tournamentTypeFilter: Locator;
    readonly regionFilter: Locator;
    readonly signInLink: Locator;
    readonly accountButton: Locator;
    readonly notificationsButton: Locator;
    readonly newGameButton: Locator;
    readonly allMyGamesLink: Locator;
    readonly lobbyMenuLink: Locator;
    readonly puzzlesMenuLink: Locator;
    readonly newsMenuLink: Locator;
    readonly masterclassesMenuLink: Locator;
    readonly playersMenuLink: Locator;
    readonly clubsMenuLink: Locator;
    readonly shopMenuLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.registerButton = page.locator("[data-component='Button']:has-text('Register for free')");
        this.tournamentsMenuLink = page.locator("[data-component='MenuItem'][data-id='tournaments']");
        this.tournamentsPageTitle = page.locator("[data-component='TournamentsTitle']");
        this.tournamentsFilter = page.locator("[data-component='TournamentsFilter']");
        this.tournamentTypeFilter = page.locator("[data-component='PopupOpener']:has-text('All types')");
        this.regionFilter = page.locator("[data-component='PopupOpener']:has-text('Worldwide')");
        this.signInLink = page.locator("[data-component='AccountPopupItem'][data-id='signIn']");
        this.accountButton = page.locator("[data-component='HeaderToolsItemAccountButton']");
        this.notificationsButton = page.locator("[data-component='PopupOpener']:has-text('Notifications')");
        this.newGameButton = page.locator("[data-component='Button']:has-text('New game')");
        this.allMyGamesLink = page.locator("[data-component='Link']:has-text('All my games')");
        this.lobbyMenuLink = page.locator("[data-component='MenuItem'][data-id='lobby']");
        this.puzzlesMenuLink = page.locator("[data-component='MenuItem'][data-id='puzzles']");
        this.newsMenuLink = page.locator("[data-component='MenuItem'][data-id='news']");
        this.masterclassesMenuLink = page.locator("[data-component='MenuItem'][data-id='masterclasses']");
        this.playersMenuLink = page.locator("[data-component='MenuItem'][data-id='players']");
        this.clubsMenuLink = page.locator("[data-component='MenuItem'][data-id='community']");
        this.shopMenuLink = page.locator("[data-component='MenuItem'][data-id='shop']");
    }

    async navigate() {
        await this.page.goto('https://worldchess.com/tournaments');
    }

    async close() {
        await this.page.close();
    }

    async clickFirstTournamentCard() {
        const firstCard = this.page.locator('[data-component*="TournamentCard"]').first();
        await firstCard.click();
    }
}