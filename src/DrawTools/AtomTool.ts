import {AtomNode} from "../AEG/AtomNode";
import {drawAtom} from "../SharedToolUtils/DrawUtils";
import {illegalColor, legalColor} from "../Themes";
import {offset} from "../SharedToolUtils/DragTool";
import {Point} from "../AEG/Point";
import {redrawTree} from "../SharedToolUtils/DrawUtils";
import {treeContext} from "../treeContext";

/**
 * Contains methods for manipulating AtomNodes on the HTML canvas.
 *
 * When an AtomNode's position is described as being valid or not,
 * This means that we are determining if it can currently be inserted into the AEGTree without intersection.
 *
 * @author Dawn Moore
 * @author Anusha Tiwari
 */

//Setting Up Canvas...
const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
const res: CanvasRenderingContext2D | null = canvas.getContext("2d");
if (res === null) {
    throw Error("2d rendering context not supported.");
}
const ctx: CanvasRenderingContext2D = res;

//Letter display next to "Current Atom:" in Draw Mode's Atom Tool toolbar.
const atomDisplay = <HTMLParagraphElement>document.getElementById("atomDisplay");

//True if the mouse has left canvas.
let wasOut: boolean;

//True if the mouse button is currently down.
let hasMouseDown: boolean;

//AtomNode we are creating. Defaults to A at position (0, 0) on canvas.
let currentAtom: AtomNode = createAtom("A", new Point(0, 0));

/**
 * Checks to see if the key from the incoming KeyboardEvent is in the Latin alphabet.
 * Then sets currentAtom's identifier to that key if true.
 *
 * @param event Incoming KeyboardEvent.
 */
export function atomKeyPress(event: KeyboardEvent) {
    const regex = new RegExp(/^[A-Za-z]$/);
    if (regex.test(event.key)) {
        currentAtom = createAtom(event.key, new Point(currentAtom.origin.x, currentAtom.origin.y));

        //If currentAtom is not the default then call determineDrawColor().
        if (currentAtom.origin.x !== 0 && currentAtom.origin.y !== 0 && hasMouseDown) {
            determineDrawColor();
        }
    }
}

/**
 * Draws currentAtom on canvas at the coordinates given by the incoming MouseEvent.
 * Then highlights currentAtom according to its position's validity.
 *
 * @param event Incoming MouseEvent.
 */
export function atomMouseDown(event: MouseEvent) {
    wasOut = false;
    hasMouseDown = true;
    currentAtom = createAtom(
        currentAtom.identifier,
        new Point(event.clientX - offset.x, event.clientY - offset.y)
    );
    determineDrawColor();
}

/**
 * Updates currentAtom's coordinates to the coordinates given by the incoming MouseEvent.
 * Then updates highlight colors according to its new position's validity.
 *
 * @param event Incoming MouseEvent.
 */
export function atomMouseMove(event: MouseEvent) {
    currentAtom = createAtom(
        currentAtom.identifier,
        new Point(event.clientX - offset.x, event.clientY - offset.y)
    );
    determineDrawColor();
}

/**
 * Inserts currentAtom at the coordinates given by the incoming MouseEvent if valid.
 * Then redraws the Draw Mode AEGTree regardless.
 *
 * @param event Incoming MouseEvent.
 */
export function atomMouseUp(event: MouseEvent) {
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
 * Sets wasOut to true.
 * Then redraws the Draw Mode AEGtree.
 */
export function atomMouseOut() {
    wasOut = true;
    redrawTree(treeContext.tree);
}

/**
 * Constructs a new AtomNode at the incoming Point.
 * This AtomNode is created with the incoming string as an identifier and a width and height retrieved from the font's text metrics.
 *
 * @param identifier Incoming string.
 * @param origin Incoming Point.
 * @returns AtomNode at origin with identifier as its letter and appropriate width and height depending on font.
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
 * Draws currentAtom as legalColor or illegalColor.
 * legalColor is chosen if currentAtom's position is valid.
 * IllegalColor is chose if currentAtom's position is not valid.
 */
function determineDrawColor() {
    redrawTree(treeContext.tree);
    if (!wasOut) {
        if (treeContext.tree.canInsert(currentAtom)) {
            drawAtom(currentAtom, legalColor(), true);
        } else {
            drawAtom(currentAtom, illegalColor(), true);
        }
    }
}
