import {test, expect} from "@playwright/test";
//import {aegStringify} from "../../src/index";
import {AEGTree} from "../../src/AEG/AEGTree";
import {JSHandle} from "@playwright/test";

test.beforeEach(async ({page}) => {
    page.goto("/");
    await page.waitForLoadState();
});

test.describe("Basic graph string/drawing soliloquy:", () => {
    test.skip("Empty canvas should stringify appropriately.", async ({page}) => {
        //const tree: JSHandle<AEGTree> = await page.evaluateHandle(() => window.tree);
        const tree: AEGTree = await page.evaluate("window.tree");
        //console.log(aegStringify(await page.evaluate(tree)));
        //await expect(page.evaluate(aegStringify(window.tree))).toBe(aegStringify(window.tree));
        //compare expected json to the json produced by our program
        await expect(page.url()).toContain("Peirce"); //placeholder expect statement
    });

    test("Graph string with one cut should produce an appropriate string.", async ({page}) => {
        const canvas = page.locator("#canvas");
        await page.getByTitle("Cut Tool").click();
        await canvas.dragTo(canvas, {
            sourcePosition: {x: 200, y: 200}, //greater than minimum Ellipse creation
            targetPosition: {x: 300, y: 300},
        });
        await expect(page.locator("#graphString")).toHaveText("[()]");
    });

    test("Graph string with one atom should produce an appropriate string.", async ({page}) => {
        const canvas = page.locator("#canvas");
        await page.getByTitle("Atom Tool").click();
        await canvas.click({position: {x: 600, y: 600}}); //arbitrary location, we just need them on the canvas
        await expect(page.locator("#graphString")).toHaveText("[A]");
    });
});

//skipping for right now. will determine the organization for and the placement of later
test.fixme("A or B:", async ({page}) => {
    //test on local site instead of production site
    await page.goto("/");

    const canvas = page.locator("canvas");
    await page.getByTitle("Cut Tool").click();

    await canvas.dragTo(canvas, {
        sourcePosition: {x: 100, y: 150},
        targetPosition: {x: 1200, y: 700},
    });

    await canvas.dragTo(canvas, {
        sourcePosition: {x: 250, y: 250},
        targetPosition: {x: 500, y: 500},
    });

    await canvas.dragTo(canvas, {
        sourcePosition: {x: 600, y: 420},
        targetPosition: {x: 900, y: 550},
    });

    await canvas.dragTo(canvas, {
        sourcePosition: {x: 550, y: 400},
        targetPosition: {x: 950, y: 600},
    });

    await canvas.dragTo(canvas, {
        sourcePosition: {x: 300, y: 300},
        targetPosition: {x: 450, y: 450},
    });

    await page.getByTitle("Atom Tool").click();

    await canvas.click({
        position: {x: 350, y: 350},
    });

    await page.getByTitle("Atom Tool").press("B");

    await canvas.click({
        position: {x: 700, y: 500},
    });

    await page.getByTitle("Atom Tool").press("C");

    await canvas.click({
        position: {x: 350, y: 400},
    });

    await expect(page.locator("#graphString")).toHaveText("[(((A C)) ((B)))]");

    //const downloadPromise = page.waitForEvent("download");
    //await page.keyboard.down("Control");
    //await page.keyboard.press("s");
    //await page.keyboard.up("Control");
    //const download = await downloadPromise;
    //await download.saveAs("./" + download.suggestedFilename());

    //All of these should fail, and the canvas should remain the same.
    await page.getByTitle("Cut Tool").click();

    await canvas.dragTo(canvas, {
        sourcePosition: {x: 300, y: 300},
        targetPosition: {x: 600, y: 600},
    });

    await page.getByTitle("Atom Tool").click();

    await page.getByTitle("Atom Tool").press("D");
    await canvas.click({
        position: {x: 350, y: 350},
    });

    await page.getByTitle("Atom Tool").press("E");
    await canvas.click({
        position: {x: 550, y: 550},
    });

    await expect(page.locator("#graphString")).toHaveText("[(((A C)) ((B)))]");
});
