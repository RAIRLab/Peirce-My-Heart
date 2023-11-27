import {test, expect} from "@playwright/test";

test.describe("Information page soliloquy:", () => {
    test("User should be able to access the information page via button.", async ({page}) => {
        //test on local site instead of production site for all tests
        await page.waitForLoadState();
        await page.goto("/");
        await page.getByTitle("About AEG").click();
        await page.waitForLoadState();
        await expect(page.waitForURL("**/aeg.html")).toBeTruthy();
    });

    test("User should be able to access the information page via button and view the about page after.", async ({
        page,
    }) => {
        await page.waitForLoadState();
        await page.goto("/");
        await page.getByTitle("About AEG").click();
        await page.getByTitle("Learn More!").click();
        await page.waitForLoadState();
        await expect(page.waitForURL("**/about.html")).toBeTruthy();
    });

    test("User should be able to access the information page via button and return to draw mode.", async ({
        page,
    }) => {
        await page.waitForLoadState();
        await page.goto("/");
        await page.getByTitle("About AEG").click();
        await page.getByTitle("Prove!").click();
        await page.waitForLoadState();
        await expect(page.waitForURL("**/index.html")).toBeTruthy();
    });

    test("User should be able to access the information page via button and view the documentation page after.", async ({
        page,
    }) => {
        await page.waitForLoadState();
        await page.goto("/");
        await page.getByTitle("About AEG").click();
        await page.getByTitle("Docs!").click();
        await page.waitForLoadState();
        await expect(page.waitForURL("**/docs/")).toBeTruthy();
    });
});
