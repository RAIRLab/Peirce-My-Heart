import {test, expect} from "@playwright/test";

test.describe("Navigate from about page soliloquy:", () => {
    test("User should be able to access the information page via button.", async ({page}) => {
        await page.goto("/");
        await page.getByTitle("About AEG").click();
        await page.getByTitle("Learn More!").click();
        await page.getByTitle("Home").click();
        await expect(page.waitForURL("**/aeg.html")).toBeTruthy();
    });

    test("User should be able to access the application page via button.", async ({page}) => {
        await page.goto("/");
        await page.getByTitle("About AEG").click();
        await page.getByTitle("Learn More!").click();
        await page.getByTitle("App").click();
        await expect(page.waitForURL("**/index.html")).toBeTruthy();
    });
});
