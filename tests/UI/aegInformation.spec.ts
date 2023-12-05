import {test, expect} from "@playwright/test";

test.beforeEach(async ({page}) => {
    //test on local site instead of production site for all tests
    await page.goto("/");
    await page.waitForLoadState();
});

test.describe("Navigate to and from information page soliloquy:", () => {
    test("User should be able to access the information page via button.", async ({page}) => {
        //test on local site instead of production site for all tests
        await page.getByTitle("About AEG").click();
        await page.waitForLoadState();
        await expect(page.url()).toContain("aeg.html");
    });

    test("User should be able to access the information page via button and view the about page after.", async ({
        page,
    }) => {
        await page.getByTitle("About AEG").click();
        await page.waitForLoadState();
        await page.getByTitle("Learn More!").click();
        await page.waitForLoadState();
        await expect(page.url()).toContain("about.html");
    });

    test("User should be able to access the information page via button and return to draw mode.", async ({
        page,
    }) => {
        await page.getByTitle("About AEG").click();
        await page.waitForLoadState();
        await page.getByTitle("Prove!").click();
        await page.waitForLoadState();
        await expect(page.url()).toContain("index.html");
    });

    test("User should be able to access the information page via button and view the documentation page after.", async ({
        page,
    }) => {
        await page.getByTitle("About AEG").click();
        await page.waitForLoadState();
        await page.getByTitle("Docs!").click();
        await page.waitForLoadState();
        await expect(page.url()).toContain("docs/");
    });
});
