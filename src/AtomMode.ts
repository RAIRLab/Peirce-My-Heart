/**
 * File containing atom based event functions.
 * @author Dawn Moore
 */

import {Point} from "./AEG/Point";
import {AtomNode} from "./AEG/AtomNode";
import {redrawCut, tree} from "./index";
import {Rectangle} from "./AEG/Rectangle";
import {offset} from "./DragMode";

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

//Creates a default atom with effectively no rectangle or point. (Will be swapped out soon)
let currentAtom: AtomNode = new AtomNode(
    "A",
    new Point(0, 0),
    new Rectangle(new Point(0, 0), 0, 0)
); //Default character A
atomDisplay.innerHTML = currentAtom.identifier;

/**
 * Checks to see if the pressed key is a valid letter, if yes sets it to the atom node.
 * @param event The keypress event
 */
export function atomKeyPress(event: KeyboardEvent) {
    const regex = new RegExp(/^[A-Za-z]$/);
    if (regex.test(event.key)) {
        currentAtom.identifier = event.key;
        atomDisplay.innerHTML = currentAtom.identifier;
    }
}

/**
 * If a legal letter has been chosen places it on the canvas.
 * Color is based on whether the atom is in a valid place, determines the atom bounding box.
 * @param event The mouse down event
 * @returns Whether or not the mouse event took place
 */
export function atomMouseDown(event: MouseEvent) {
    atomMetrics = ctx.measureText(currentAtom.identifier);
    wasOut = false;
    const startVertex: Point = new Point(
        event.clientX - offset.x,
        event.clientY - atomMetrics.actualBoundingBoxAscent - offset.y
    );
    currentAtom.rectangle = new Rectangle(
        startVertex,
        atomMetrics.width,
        atomMetrics.fontBoundingBoxDescent + atomMetrics.actualBoundingBoxAscent
    );
    currentAtom.origin = new Point(event.clientX - offset.x, event.clientY - offset.y);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCut(tree.sheet, offset);
    if (tree.canInsert(currentAtom)) {
        drawAtom(currentAtom, "#00FF00");
    } else {
        drawAtom(currentAtom, "#FF0000");
    }
}

/**
 * Moves the current atom to the current mouse position, redraws the canvas and redraws the atom.
 * @param event The mouse move event
 */
export function atomMouseMove(event: MouseEvent) {
    currentAtom.origin = new Point(event.clientX - offset.x, event.clientY - offset.y);
    currentAtom.rectangle.startVertex = new Point(
        event.clientX - offset.x,
        event.clientY - atomMetrics.actualBoundingBoxAscent - offset.y
    );

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCut(tree.sheet, offset);
    if (!wasOut) {
        if (tree.canInsert(currentAtom)) {
            drawAtom(currentAtom, "#00FF00");
        } else {
            drawAtom(currentAtom, "#FF0000");
        }
    }
}

/**
 * If the atom is in a valid place, adds it to the tree. Redraws the canvas and resets currentAtom.
 * @param event The mouse up event
 */
export function atomMouseUp() {
    if (tree.canInsert(currentAtom) && !wasOut) {
        tree.insert(currentAtom);
    }
    currentAtom = new AtomNode(
        currentAtom.identifier,
        new Point(0, 0),
        new Rectangle(new Point(0, 0), 0, 0)
    );
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCut(tree.sheet, offset);
}

/**
 * If the mouse leaves the canvas resets the current atom.
 */
export function atomMouseOut() {
    currentAtom = new AtomNode(
        currentAtom.identifier,
        new Point(0, 0),
        new Rectangle(new Point(0, 0), 0, 0)
    );
    wasOut = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCut(tree.sheet, offset);
}

/**
 * Draws the given atomNode with the given color.
 * @param thisAtom the atomMode to be drawn.
 * @param color the color of the atom.
 */
function drawAtom(thisAtom: AtomNode, color: string) {
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    const displayBox = thisAtom.rectangle;
    ctx.beginPath();
    ctx.fillText(thisAtom.identifier, thisAtom.origin.x + offset.x, thisAtom.origin.y + offset.y);
    ctx.rect(
        displayBox.startVertex.x + offset.x,
        displayBox.startVertex.y + offset.y,
        displayBox.width,
        displayBox.height
    );
    ctx.stroke();
}
