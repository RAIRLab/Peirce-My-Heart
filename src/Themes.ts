/**
 * @author James Oswald
 * This file provides basic utilities for extracting important colors
 * for the application from the CSS themes
 */
import {tree, redrawCut} from "./index";
import {offset} from "./DragMode";

const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
const themeSelector: HTMLSelectElement = <HTMLSelectElement>document.getElementById("theme-select");
const res: CanvasRenderingContext2D | null = canvas.getContext("2d");
if (res === null) {
    throw Error("2d rendering context not supported");
}
const ctx: CanvasRenderingContext2D = res;

/**
 * Computes the value of a variable from a CSS style sheet
 */
function cssVar(varName: string): string {
    return getComputedStyle(document.body).getPropertyValue(varName);
}

let legalColorStr: string = cssVar("--good-placement");
let illegalColorStr: string = cssVar("--bad-placement");
let placedColorStr: string = cssVar("--canvas-items");

/**
 * Redraw the canvas and update the HTML states
 */
function setTheme() {
    /*
    This is a really bad way of doing things, but we have to ensure this
    code is executed AFTER the themeSelector input handler from the library
    so that the new styles have been applied by the time this code runs.
    Due to how primitive the library is, there is no way to check for this
    automatically other than an even more complicated solution like observing putting new colors
    on elements, this seems to wait just long enough that the library handler finishes first.
    https://stackoverflow.com/questions/47860455/how-to-ensure-an-eventlistener-is-executed-last
    */
    setTimeout(() => {
        legalColorStr = cssVar("--good-placement");
        illegalColorStr = cssVar("--bad-placement");
        placedColorStr = cssVar("--canvas-items");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawCut(tree.sheet, offset);
    });
}

themeSelector.addEventListener("input", () => {
    setTheme();
});
window.addEventListener("DOMContentLoaded", () => {
    setTheme();
});

/**
 * @returns the string color of components not allowed to be placed / dropped on the canvas
 */
export function illegalColor(): string {
    return illegalColorStr;
}

/**
 * @returns the string color of components allowed to be placed / dropped on the canvas
 */
export function legalColor(): string {
    return legalColorStr;
}

/**
 * @returns the color of placed components on the canvas
 */
export function placedColor(): string {
    return placedColorStr;
}
