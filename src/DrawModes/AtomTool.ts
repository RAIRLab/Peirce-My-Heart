/**
 * File containing atom based event functions.
 * @author Dawn Moore
 */

import {Point} from "../AEG/Point";
import {AtomNode} from "../AEG/AtomNode";
import {treeContext} from "../treeContext";
import {redrawTree} from "../SharedToolUtils/DrawUtils";
import {offset} from "../SharedToolUtils/DragTool";
import {legalColor, illegalColor} from "../Themes";
import {drawAtom} from "../SharedToolUtils/DrawUtils";

//Setting Up Canvas
const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
const res: CanvasRenderingContext2D | null = canvas.getContext("2d");
if (res === null) {
    throw Error("2d rendering context not supported");
}
const ctx: CanvasRenderingContext2D = res;

//HTML letter display
const atomDisplay = <HTMLParagraphElement>document.getElementById("atomDisplay");

//Tracks if the mouse has ever left canvas disallowing future movements.
let wasOut: boolean;

//Tracks whether the mouse button is currently down.
let hasMouseDown: boolean;

//The current atom we are creating
let currentAtom: AtomNode = createAtom("A", new Point(0, 0));

/**
 * Checks to see if the pressed key is a valid letter, if yes sets it to the atom node.
 * @param event The keypress event
 */
export function atomKeyPress(event: KeyboardEvent) {
    const regex = new RegExp(/^[A-Za-z]$/);
    if (regex.test(event.key)) {
        currentAtom = createAtom(event.key, new Point(currentAtom.origin.x, currentAtom.origin.y));

        //If the currentAtom is not the default then see if it can be drawn there and draw it.
        if (currentAtom.origin.x !== 0 && currentAtom.origin.y !== 0 && hasMouseDown) {
            drawLegal();
        }
    }
}

/**
 * If a legal letter has been chosen places it on the canvas.
 * Color is based on whether the atom is in a valid place, determines the atom bounding box.
 * @param event The mouse down event
 * @returns Whether or not the mouse event took place
 */
export function atomMouseDown(event: MouseEvent) {
    wasOut = false;
    hasMouseDown = true;
    currentAtom = createAtom(
        currentAtom.identifier,
        new Point(event.clientX - offset.x, event.clientY - offset.y)
    );
    drawLegal();
}

/**
 * Moves the current atom to the current mouse position, redraws the canvas and redraws the atom.
 * @param event The mouse move event
 */
export function atomMouseMove(event: MouseEvent) {
    currentAtom = createAtom(
        currentAtom.identifier,
        new Point(event.clientX - offset.x, event.clientY - offset.y)
    );
    drawLegal();
}

/**
 * If the atom is in a valid place, adds it to the tree. Redraws the canvas and resets currentAtom.
 * @param event The mouse up event
 */
export function atomMouseUp(event: MouseEvent) {
    canvas.style.cssText = "cursor: default";
    currentAtom = createAtom(
        currentAtom.identifier,
        new Point(event.clientX - offset.x, event.clientY - offset.y)
    );
    if (treeContext.tree.canInsert(currentAtom) && !wasOut) {
        treeContext.tree.insert(currentAtom);
    }
    redrawTree(treeContext.tree);
    hasMouseDown = false;
}

/**
 * If the mouse leaves the canvas resets the current atom.
 */
export function atomMouseOut() {
    canvas.style.cssText = "cursor: default";
    wasOut = true;
    redrawTree(treeContext.tree);
}

/**
 * Helper function to construct a new atom node with a created width and height based on the font.
 * @param identifier The letter representation of the atom
 * @param origin The original place for the atom to be drawn and the bounding box
 * @returns The newly made atom
 */
function createAtom(identifier: string, origin: Point): AtomNode {
    atomDisplay.innerHTML = identifier;
    const atomMetrics: TextMetrics = ctx.measureText(identifier);
    return new AtomNode(
        identifier,
        new Point(origin.x, origin.y),
        atomMetrics.width,
        atomMetrics.fontBoundingBoxDescent + atomMetrics.actualBoundingBoxAscent
    );
}

/**
 * Draws the global currentAtom based on if it can be inserted drawing it either legal or illegal.
 */
function drawLegal() {
    redrawTree(treeContext.tree);
    if (!wasOut) {
        if (treeContext.tree.canInsert(currentAtom)) {
            canvas.style.cssText = "cursor: default";
            drawAtom(currentAtom, legalColor(), true);
        } else {
            canvas.style.cssText = "cursor: no-drop";
            drawAtom(currentAtom, illegalColor(), true);
        }
    }
}
