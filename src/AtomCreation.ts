/**
 * Atom Event Handler
 * @author Dawn Moore
 */

import {Point} from "./AEG/Point";
import {AtomNode} from "./AEG/AtomNode";
import {redrawCut, tree} from "./index";
import {Rectangle} from "./AEG/Rectangle";

const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
const res: CanvasRenderingContext2D | null = canvas.getContext("2d");
if (res === null) {
    throw Error("2d rendering context not supported");
}
const ctx: CanvasRenderingContext2D = res;
let currentPoint: Point;
let atom: string;

/**
 * A function to begin atom creation.
 * If ellipseMode was previously active, remove the listener.
 */
export function atomCreation() {
    window.addEventListener("keydown", atomChoose);
}

/**
 * Determines the character the atom will appear as
 * @param event the event of a keyboard press
 */
function atomChoose(event: KeyboardEvent) {
    atom = event.key;
    canvas.addEventListener("mousedown", placeAtom);
}

/**
 * Determines the starting point for an atom being placed, then listens for movement.
 * @param event The event of the mouse being clicked
 */
function placeAtom(event: MouseEvent) {
    const startingPoint: Point = {
        x: event.clientX,
        y: event.clientY,
    };
    currentPoint = startingPoint;
    ctx.fillText(atom, startingPoint.x, startingPoint.y);
    ctx.stroke();
    canvas.addEventListener("mousemove", moveAtom);
    canvas.addEventListener("mouseup", atomUp);
    canvas.addEventListener("mouseout", mouseOut);
}

/**
 * Changes the location of the atom and redraws the screen with each movement.
 * @param event The event of the mouse moving
 */
function moveAtom(event: MouseEvent) {
    currentPoint = {
        x: event.clientX,
        y: event.clientY,
    };
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCut(tree.sheet);
    ctx.fillText(atom, currentPoint.x, currentPoint.y);
    ctx.stroke();
}

/**
 * When the mouse is lifted up, removes the movement listener and adds it to the tree itself.
 */
function atomUp() {
    let atomMetrics: TextMetrics = ctx.measureText(atom);
    let newRect: Rectangle = new Rectangle(
        new Point(currentPoint.x, currentPoint.y + atomMetrics.actualBoundingBoxAscent),
        atomMetrics.width,
        atomMetrics.fontBoundingBoxDescent + atomMetrics.actualBoundingBoxAscent);
    const newAtom: AtomNode = new AtomNode(atom, currentPoint, newRect);
    tree.insert(newAtom);
    canvas.removeEventListener("mousemove", moveAtom);
    canvas.removeEventListener("mouseup", atomUp);
    canvas.removeEventListener("mouseOut", mouseOut);
}

/**
 * A temporary function to cancel the current atom if the mouse exits the canvas area.
 */
function mouseOut() {
    canvas.removeEventListener("mousemove", moveAtom);
    canvas.removeEventListener("mouseup", atomUp);
    canvas.removeEventListener("mouseOut", mouseOut);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCut(tree.sheet);
}

/**
 * Removes the listeners when the user is done placing atoms.
 */
export function removeAtomListener() {
    canvas.removeEventListener("mousedown", placeAtom);
    window.removeEventListener("keydown", atomChoose);
}
