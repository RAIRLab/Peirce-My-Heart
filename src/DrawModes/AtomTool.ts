/**
 * File containing atom based event functions.
 * @author Dawn Moore
 */

import {Point} from "../AEG/Point";
import {AtomNode} from "../AEG/AtomNode";
import {treeContext} from "../treeContext";
import {redrawTree} from "./DrawUtils";
import {offset} from "./DragTool";
import {legalColor, illegalColor} from "../Themes";
import {drawAtom} from "./DrawUtils";

//Setting Up Canvas
const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
const res: CanvasRenderingContext2D | null = canvas.getContext("2d");
if (res === null) {
    throw Error("2d rendering context not supported");
}
const ctx: CanvasRenderingContext2D = res;

//HTML letter display
const atomDisplay = <HTMLParagraphElement>document.getElementById("atomDisplay");

//Allows font measurement in pixels to creature atom bounding box.
let atomMetrics: TextMetrics;

//Tracks if the mouse has ever left canvas disallowing future movements.
let wasOut: boolean;

//Current MouseEvent
let mEvent: MouseEvent = new MouseEvent("mousedown");

let identifier = "A";
atomDisplay.innerHTML = identifier;

/**
 * Checks to see if the pressed key is a valid letter, if yes sets it to the atom node.
 * @param event The keypress event
 */
export function atomKeyPress(event: KeyboardEvent) {
    const regex = new RegExp(/^[A-Za-z]$/);
    if (regex.test(event.key)) {
        identifier = event.key;
        atomDisplay.innerHTML = identifier;
    }
    atomMouseDown(mEvent);
}

/**
 * If a legal letter has been chosen places it on the canvas.
 * Color is based on whether the atom is in a valid place, determines the atom bounding box.
 * @param event The mouse down event
 * @returns Whether or not the mouse event took place
 */
export function atomMouseDown(event: MouseEvent) {
    mEvent = event;
    atomMetrics = ctx.measureText(identifier);
    wasOut = false;
    const currentAtom = createAtom(event);

    redrawTree(treeContext.tree);
    const color = treeContext.tree.canInsert(currentAtom) ? legalColor() : illegalColor();
    drawAtom(currentAtom, color, true);
}

/**
 * Moves the current atom to the current mouse position, redraws the canvas and redraws the atom.
 * @param event The mouse move event
 */
export function atomMouseMove(event: MouseEvent) {
    mEvent = event;
    const currentAtom = createAtom(event);

    redrawTree(treeContext.tree);
    if (!wasOut) {
        if (treeContext.tree.canInsert(currentAtom)) {
            drawAtom(currentAtom, legalColor(), true);
        } else {
            drawAtom(currentAtom, illegalColor(), true);
        }
    }
}

/**
 * If the atom is in a valid place, adds it to the tree. Redraws the canvas and resets currentAtom.
 * @param event The mouse up event
 */
export function atomMouseUp(event: MouseEvent) {
    const currentAtom = createAtom(event);
    if (treeContext.tree.canInsert(currentAtom) && !wasOut) {
        treeContext.tree.insert(currentAtom);
    }
    redrawTree(treeContext.tree);
    mEvent = new MouseEvent("mousedown");
}

/**
 * If the mouse leaves the canvas resets the current atom.
 */
export function atomMouseOut() {
    wasOut = true;
    redrawTree(treeContext.tree);
    mEvent = new MouseEvent("mousedown");
}

function createAtom(event: MouseEvent): AtomNode {
    return new AtomNode(
        identifier,
        new Point(event.clientX - offset.x, event.clientY - offset.y),
        atomMetrics.width,
        atomMetrics.fontBoundingBoxDescent + atomMetrics.actualBoundingBoxAscent
    );
}
