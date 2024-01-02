import {test, expect} from "@playwright/test";

import * as fs from 'fs'; //nabbing the node.js module for file system shenanigans

let emptyTreeString: string;
let loneAtomString: string;
let loneCutString: string;

let disjunctionString: string;

test.beforeAll("Reading expected strings in from .json files...", async () => {
    fs.readFile(__dirname + "/expectedTrees/emptyTree.json", "utf8", (err, data: string) => {
        emptyTreeString = data;
    });

    fs.readFile(__dirname + "/expectedTrees/loneAtom.json", "utf8", (err, data: string) => {
        loneAtomString = data;
    });

    fs.readFile(__dirname + "/expectedTrees/loneCut.json", "utf8", (err, data: string) => {
        loneCutString = data;
    });

    fs.readFile(
        __dirname + "/expectedTrees/disjunction.json",
        "utf8",
        (err, data: string) => {
            disjunctionString = data;
        }
    );
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

    test("Canvas with one atom should produce an appropriate string.", async ({page}) => {
        const canvas = page.locator("#canvas");
        await page.getByTitle("Atom Tool").click();
        await canvas.click({position: {x: 600, y: 600}}); //arbitrary location, we just need them on the canvas
        const windowString: string = await page.evaluate("window.aegStringify(window.tree)");
        expect(windowString).toContain(loneAtomString);
    });

    test("Canvas with illegal atom placements should produce an appropriate string.", async ({
        page,
    }) => {
        const canvas = page.locator("#canvas");
        await page.getByTitle("Atom Tool").click();
        await canvas.click({position: {x: 600, y: 600}});
        await page.getByTitle("Atom Tool").press("B");
        await canvas.click({position: {x: 600, y: 600}});
        await page.getByTitle("Atom Tool").press("C");
        await canvas.click({position: {x: 600, y: 600}});
        await page.getByTitle("Atom Tool").press("D");
        await canvas.click({position: {x: 600, y: 600}});
        await page.getByTitle("Atom Tool").press("E");
        await canvas.click({position: {x: 600, y: 600}});
        const windowString: string = await page.evaluate("window.aegStringify(window.tree)");
        expect(windowString).toContain(loneAtomString);
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

    test("Graph string with illegal cuts should produce an appropriate string.", async ({page}) => {
        const canvas = page.locator("#canvas");
        await page.getByTitle("Cut Tool").click();
        await canvas.dragTo(canvas, {
            sourcePosition: {x: 200, y: 200},
            targetPosition: {x: 300, y: 300},
        });
        await canvas.dragTo(canvas, {
            sourcePosition: {x: 250, y: 250},
            targetPosition: {x: 300, y: 300},
        });
        await canvas.dragTo(canvas, {
            sourcePosition: {x: 250, y: 250},
            targetPosition: {x: 310, y: 310},
        });
        await canvas.dragTo(canvas, {
            sourcePosition: {x: 280, y: 280},
            targetPosition: {x: 400, y: 300},
        });
        const windowString: string = await page.evaluate("window.aegStringify(window.tree)");
        await expect(windowString).toBe(loneCutString);
    });
});

test.describe("Basic theorem soliloquy:", () => {
    test("A or B:", async ({page}) => {
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

        await page.getByTitle("Atom Tool").click();

        await canvas.click({
            position: {x: 350, y: 350},
        });

        await page.getByTitle("Atom Tool").press("B");

        await canvas.click({
            position: {x: 700, y: 500},
        });

        const windowString: string = await page.evaluate("window.aegStringify(window.tree)");
        await expect(windowString).toBe(disjunctionString);
    });
});
