/**
 * @file Contains methods for manipulating AtomNodes on the HTML canvas.
 *
 * When an AtomNode's position is described as being valid or not,
 * this means that we are determining if it can currently be inserted into the
 * AEGTree without intersection.
 *
 * @author Dawn Moore
 * @author Anusha Tiwari
 */

import {AtomNode} from "../AEG/AtomNode";
import {changeCursorStyle, getImageWidthAndHeightFromChar} from "../SharedToolUtils/DrawUtils";
import {drawAtom} from "../SharedToolUtils/DrawUtils";
import {DrawModeMove} from "../DrawHistory/DrawModeNode";
import {illegalColor, legalColor} from "../Themes";
import {offset} from "../SharedToolUtils/DragTool";
import {Point} from "../AEG/Point";
import {redrawTree} from "../SharedToolUtils/DrawUtils";
import {TreeContext} from "../TreeContext";

//Setting Up Canvas...
const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
const res: CanvasRenderingContext2D | null = canvas.getContext("2d");
if (res === null) {
    throw Error("2d rendering context not supported.");
}

//Letter display next to "Current Atom:" in Draw Mode's Atom Tool toolbar.
const atomDisplay = <HTMLParagraphElement>document.getElementById("atomDisplay");

//True if the mouse has left canvas.
let wasOut: boolean;

//True if the mouse button is currently down.
let hasMouseDown: boolean;

//AtomNode we are creating.
let currentAtom: AtomNode = setDefaultAtom();

/**
 * Checks to see if the key from the incoming KeyboardEvent is in the Latin alphabet.
 * Then sets currentAtom's identifier to that key if true.
 *
 * @param event Incoming KeyboardEvent.
 */
export function atomKeyPress(event: KeyboardEvent): void {
    const regex = new RegExp(/^[A-Za-z]$/);
    if (regex.test(event.key)) {
        currentAtom = createAtom(
            event.key,
            new Point(currentAtom.origin.x, currentAtom.origin.y + currentAtom.height)
        );

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
export function atomMouseDown(event: MouseEvent): void {
    if (currentAtom !== undefined) {
        wasOut = false;
        hasMouseDown = true;
        currentAtom = createAtom(
            currentAtom.identifier,
            new Point(event.clientX - offset.x, event.clientY - offset.y)
        );
        determineDrawColor();
    }
}

/**
 * Updates currentAtom's coordinates to the coordinates given by the incoming MouseEvent.
 * Then updates highlight colors according to its new position's validity.
 *
 * @param event Incoming MouseEvent.
 */
export function atomMouseMove(event: MouseEvent): void {
    if (currentAtom !== undefined) {
        currentAtom = createAtom(
            currentAtom.identifier,
            new Point(event.clientX - offset.x, event.clientY - offset.y)
        );
        determineDrawColor();
    }
}

/**
 * Inserts currentAtom at the coordinates given by the incoming MouseEvent if valid.
 * Then redraws the Draw Mode AEGTree regardless.
 *
 * @param event Incoming MouseEvent.
 */
export function atomMouseUp(event: MouseEvent): void {
    if (currentAtom !== undefined) {
        changeCursorStyle("cursor: default");
        currentAtom = createAtom(
            currentAtom.identifier,
            new Point(event.clientX - offset.x, event.clientY - offset.y)
        );
        if (TreeContext.tree.canInsert(currentAtom) && !wasOut) {
            TreeContext.tree.insert(currentAtom);
            TreeContext.pushToDrawStack(DrawModeMove.DRAW_ATOM);
        }
        redrawTree(TreeContext.tree);
        hasMouseDown = false;
    }
}

/**
 * Sets wasOut to true.
 * Then redraws the Draw Mode AEGtree.
 */
export function atomMouseOut(): void {
    if (currentAtom !== undefined) {
        changeCursorStyle("cursor: default");
        wasOut = true;
        redrawTree(TreeContext.tree);
    }
}

/**
 * Constructs a new AtomNode at the incoming Point.
 * This AtomNode is created with the incoming string at the incoming Point.
 *
 * @param identifier Incoming string.
 * @param origin Incoming Point.
 * @returns AtomNode at origin with identifier as its letter.
 */
function createAtom(identifier: string, origin: Point): AtomNode {
    atomDisplay.innerHTML = identifier;
    const widthAndHeight: Point = getImageWidthAndHeightFromChar(identifier);
    const width: number = widthAndHeight.x;
    const height: number = widthAndHeight.y;

    return new AtomNode(identifier, new Point(origin.x, origin.y - height), width, height);
}

/**
 * Creates and returns a default atom.
 *
 * @returns Atom with identifier A at (0, 0).
 */
function setDefaultAtom(): AtomNode {
    atomDisplay.innerHTML = "A";
    return new AtomNode("A", new Point(0, 0), 0, 0);
}

/**
 * Draws currentAtom as legalColor or illegalColor.
 * legalColor is chosen if currentAtom's position is valid.
 * IllegalColor is chosen if currentAtom's position is not valid.
 */
function determineDrawColor(): void {
    redrawTree(TreeContext.tree);
    if (!wasOut) {
        if (TreeContext.tree.canInsert(currentAtom)) {
            changeCursorStyle("cursor: default");
            drawAtom(currentAtom, legalColor(), true);
        } else {
            changeCursorStyle("cursor: no-drop");
            drawAtom(currentAtom, illegalColor(), true);
        }
    }
}
