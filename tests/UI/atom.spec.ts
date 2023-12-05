import {test, expect} from "@playwright/test";

const fs = require("fs"); //nabbing the node.js module for file system shenanigans

let emptyTreeString: string;
let loneAtomString: string;
let loneCutString: string;

test.beforeAll("Reading expected strings in from .json files...", async () => {
    fs.readFile(__dirname + "/expectedTrees/emptyTree.json", "utf8", (err: Error, data: string) => {
        emptyTreeString = data;
    });

    fs.readFile(__dirname + "/expectedTrees/loneAtom.json", "utf8", (err: Error, data: string) => {
        //loneAtomString = data.substring(data.lastIndexOf("A"), data.lastIndexOf("},"));
        loneAtomString = data;
    });

    fs.readFile(__dirname + "/expectedTrees/loneCut.json", "utf8", (err: Error, data: string) => {
        loneCutString = data;
    });
});

test.beforeEach(async ({page}) => {
    await page.goto("/");
    await page.waitForLoadState();
});

test.describe("Basic graph string/drawing soliloquy:", () => {
    test("Empty canvas should stringify appropriately.", async ({page}) => {
        const windowString: string = await page.evaluate("window.aegStringify(window.tree)");
        await expect(windowString).toBe(emptyTreeString);
    });

    test("Graph string with one cut should produce an appropriate string.", async ({page}) => {
        const canvas = page.locator("#canvas");
        await page.getByTitle("Cut Tool").click();
        await canvas.dragTo(canvas, {
            sourcePosition: {x: 200, y: 200}, //greater than minimum Ellipse creation
            targetPosition: {x: 300, y: 300},
        });
        const windowString: string = await page.evaluate("window.aegStringify(window.tree)");
        await expect(windowString).toBe(loneCutString);
    });

    test("Canvas with one atom should produce an appropriate string.", async ({page}) => {
        const canvas = page.locator("#canvas");
        await page.getByTitle("Atom Tool").click();
        await canvas.click({position: {x: 600, y: 600}}); //arbitrary location, we just need them on the canvas
        const windowString: string = await page.evaluate("window.aegStringify(window.tree)");
        expect(windowString).toContain(loneAtomString);
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
