import {Point} from "./AEG/Point";
import {AtomNode} from "./AEG/AtomNode";
import {redrawCut, tree} from "./index";

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
}

/**
 * Changes the location of the atom and redraws the screen with each movement.
 * @param event The event of the mouse moving
 */
function moveAtom(event: MouseEvent) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCut(tree.sheet);
    currentPoint = {
        x: event.clientX,
        y: event.clientY,
    };
    ctx.fillText(atom, currentPoint.x, currentPoint.y);
    ctx.stroke();
}

/**
 * When the mouse is lifted up, removes the movement listener and adds it to the tree itself.
 */
function atomUp() {
    canvas.removeEventListener("mousemove", moveAtom);
    const newAtom: AtomNode = new AtomNode(atom, currentPoint);
    tree.insertAEG(newAtom, currentPoint);
    canvas.removeEventListener("mouseup", atomUp);
}

/**
 * Removes the listeners when the user is done placing atoms.
 */
export function removeAtomListener() {
    canvas.removeEventListener("mousedown", placeAtom);
}
