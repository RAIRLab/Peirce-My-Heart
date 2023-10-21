/**
 * File containing single copy movement event handlers.
 * @author Anusha Tiwari
 * @author Dawn Moore
 */

import {Point} from "./AEG/Point";
import {AtomNode} from "./AEG/AtomNode";
import {CutNode} from "./AEG/CutNode";
import {redrawCut, tree} from "./index";
import {offset} from "./DragMode";
import {drawCut} from "./CutMode";
import {drawAtom} from "./AtomMode";
import {legalColor, illegalColor} from "./Themes";
import {alterAtom, alterCut} from "./EditModeUtils";

//Settings up Canvas
const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
const res: CanvasRenderingContext2D | null = canvas.getContext("2d");
if (res === null) {
    throw Error("2d rendering context not supported");
}
const ctx: CanvasRenderingContext2D = res;

//The initial point the user pressed down.
let startingPoint: Point;

//The node selected with the user mouse down.
let currentNode: CutNode | AtomNode | null;

//Whether or not the node is allowed to be moved (not the sheet).
let legalNode: boolean;

/**
 * Takes the point the user clicked and stores that for later use. If the lowest node containing
 * that point is not the sheet, then store that as currentNode.
 * @param event The mouse down event while in copySingle mode
 */
export function copySingleMouseDown(event: MouseEvent) {
    startingPoint = new Point(event.x - offset.x, event.y - offset.y);
    currentNode = tree.getLowestNode(startingPoint);
    if (currentNode !== tree.sheet && currentNode !== null) {
        if (currentNode instanceof CutNode && currentNode.children.length !== 0) {
            //The cut node loses custody of its children because those do not copy over during
            //copy single mode
            currentNode.children = [];
        }
        legalNode = true;
    } else {
        legalNode = false;
    }
}

/**
 * If the node is legal, and it wasn't out compare the difference between the start and the current.
 * If the node is a cut, creates a new cut with the altered center and checks to see if it can be
 * entered into the current location. If yes draws the cut legal color otherwise illegal color.
 * For atoms instead of altering the center it alters the origin position and does the same check.
 * @param event The mouse move event while in copySingle mode
 */
export function copySingleMouseMove(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );
        //If the node is a cut, and it has an ellipse, make a temporary cut and draw that.
        if (currentNode instanceof CutNode) {
            const tempCut: CutNode = alterCut(currentNode, moveDifference);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            redrawCut(tree.sheet, offset);

            if (tree.canInsert(tempCut)) {
                drawCut(tempCut, legalColor());
            } else {
                drawCut(tempCut, illegalColor());
            }
        } //If the node is an atom, make a temporary atom and check legality, drawing that.
        else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = alterAtom(currentNode, moveDifference);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            redrawCut(tree.sheet, offset);

            if (tree.canInsert(tempAtom)) {
                drawAtom(tempAtom, legalColor(), true);
            } else {
                drawAtom(tempAtom, illegalColor(), true);
            }
        }
    }
}

/**
 * If the node is legal, and the mouse has not been out compares the start and the current.
 * If the new temporary node is in a legal position inserts the temporary cut as the copied cut.
 * Otherwise copy failed and nothing is inserted.
 * @param event The mouse up event while in copySingle mode
 */
export function copySingleMouseUp(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );
        if (currentNode instanceof CutNode && currentNode.ellipse !== null) {
            const tempCut: CutNode = alterCut(currentNode, moveDifference);

            //If the new location is legal, insert the copied cut.
            if (tree.canInsert(tempCut)) {
                tree.insert(tempCut);
            }
        } else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = alterAtom(currentNode, moveDifference);

            //If the new location is legal, insert the copied atom.
            if (tree.canInsert(tempAtom)) {
                tree.insert(tempAtom);
            }
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawCut(tree.sheet, offset);
    }
    legalNode = false;
}

/**
 * If the mouse is moved outside of the canvas, sets wasOut to true.
 * Redraws the canvas.
 */
export function copySingleMouseOut() {
    legalNode = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCut(tree.sheet, offset);
}
