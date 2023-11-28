import {test, expect} from "@playwright/test";

test.beforeEach(async ({page}) => {
    //test on local site instead of production site for all tests
    await page.goto("/");
    await page.waitForLoadState();
});

test.describe("Navigate from about page soliloquy:", () => {
    test("User should be able to access the information page via button.", async ({page}) => {
        await page.getByTitle("About AEG").click();
        await page.waitForLoadState();
        await page.getByTitle("Learn More!").click();
        await page.waitForLoadState();
        await page.getByTitle("Home").click();
        await page.waitForLoadState();
        await expect(page.url()).toContain("aeg.html");
    });

    test("User should be able to access the application page via button.", async ({page}) => {
        await page.getByTitle("About AEG").click();
        await page.waitForLoadState();
        await page.getByTitle("Learn More!").click();
        await page.waitForLoadState();
        await page.getByTitle("App").click();
        await page.waitForLoadState();
        await expect(page.url()).toContain("index.html");
    });
});
