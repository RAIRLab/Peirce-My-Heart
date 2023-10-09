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
    window.addEventListener("keypress", atomChoose);
}

/**
 * Determines the character the atom will appear as
 * @param event the event of a keyboard press
 */
function atomChoose(event: KeyboardEvent) {
    if (isLetter(event.key)) {
        canvas.addEventListener("mousedown", placeAtom);
        atom = event.key;
    }
}

/**
 * Determines the starting point for an atom being placed, then listens for movement.
 * @param event The event of the mouse being clicked
 */
function placeAtom(event: MouseEvent) {
    const startingPoint: Point = new Point(event.clientX, event.clientY);
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
    currentPoint = new Point(event.clientX, event.clientY);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCut(tree.sheet);
    ctx.fillText(atom, currentPoint.x, currentPoint.y);
    ctx.stroke();
}

/**
 * When the mouse is lifted up, removes the movement listener and adds it to the tree itself.
 */
function atomUp() {
    const atomMetrics: TextMetrics = ctx.measureText(atom);
    const newRect: Rectangle = new Rectangle(
        new Point(currentPoint.x, currentPoint.y - atomMetrics.actualBoundingBoxAscent),
        atomMetrics.width,
        atomMetrics.fontBoundingBoxDescent + atomMetrics.actualBoundingBoxAscent
    );
    const newAtom: AtomNode = new AtomNode(atom, currentPoint, newRect);
    tree.insert(newAtom);
    console.log(tree.toString());
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

/**
 * Checks to see if the letter just pressed by the user is a letter that can be used for an atom.
 * @param letter The letter to be checked in the RegExp
 * @returns whether or not the selected character is a letter
 */
function isLetter(letter: string): boolean {
    const regex = new RegExp(/^[A-Za-z]$/);
    if (regex.test(letter)) {
        return true;
    }
    return false;
}
