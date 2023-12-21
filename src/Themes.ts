import {redrawProof, redrawTree} from "./SharedToolUtils/DrawUtils";
import {TreeContext} from "./TreeContext";

/**
 * Provides utilities for extracting important colors for the application from the CSS themes.
 *
 * @author James Oswald
 */

//Next to the save button.
const themeSelector: HTMLSelectElement = <HTMLSelectElement>document.getElementById("theme-select");

/**
 * Computes the value of an incoming variable from a CSS Style Sheet.
 *
 * @param varName Variable from a CSS Style Sheet.
 * @returns Property value of varName in string form.
 */
function cssVar(varName: string): string {
    return getComputedStyle(document.body).getPropertyValue(varName);
}

let legalColorStr: string = cssVar("--good-placement");
let illegalColorStr: string = cssVar("--bad-placement");
let placedColorStr: string = cssVar("--canvas-items");

/**
 * Redraws the canvas and updates the HTML states.
 */
function setTheme(): void {
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
        TreeContext.modeState === "Draw" ? redrawTree(TreeContext.tree) : redrawProof();
    });
}

themeSelector.addEventListener("input", () => {
    setTheme();
});
window.addEventListener("DOMContentLoaded", () => {
    setTheme();
});

/**
 * Returns the color of illegal components on canvas.
 * This illegal color is used to highlight nodes for deletion and nodes not allowed to be placed.
 *
 * @returns Color of deletions and illegal placements on canvas.
 */
export function illegalColor(): string {
    return illegalColorStr;
}

/**
 * Returns the color of legal placements on canvas.
 * This legal color is used to highlight nodes in non-intersecting positions.
 *
 * @returns Color of legal placements on canvas.
 */
export function legalColor(): string {
    return legalColorStr;
}

/**
 * Returns the color of a placed node on canvas.
 * This placed color is used for nodes that are already in the Draw or Proof Mode AEGTree.
 *
 * @returns Color of placed nodes on canvas.
 */
export function placedColor(): string {
    return placedColorStr;
}
