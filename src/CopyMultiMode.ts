/**
 * File containing copy node movement event handlers.
 * @author Anusha Tiwari
 * @author Dawn Moore
 */

import {Point} from "./AEG/Point";
import {AtomNode} from "./AEG/AtomNode";
import {CutNode} from "./AEG/CutNode";
import {redrawCut, tree} from "./index";
import {offset} from "./DragMode";
import {drawAtom} from "./AtomMode";
import {legalColor, illegalColor} from "./Themes";
import {validateChildren, drawAltered, insertChildren} from "./ModeUtils";

//Setting Up Canvas
const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
const res: CanvasRenderingContext2D | null = canvas.getContext("2d");
if (res === null) {
    throw Error("2d rendering context not supported");
}
const ctx: CanvasRenderingContext2D = res;

//The initial point the user pressed down.
let startingPoint: Point;

//The current node and its children we will be moving.
let currentNode: CutNode | AtomNode;

//Whether or not the node is allowed to be moved (not the sheet).
let legalNode: boolean;

/**
 * Takes the starting point and sets the lowest node containing that point that is not the sheet to
 * the current node.
 * @param event The mouse down event while in copyMulti mode.
 */
export function copyMultiMouseDown(event: MouseEvent) {
    startingPoint = new Point(event.x - offset.x, event.y - offset.y);
    if (tree.getLowestNode(startingPoint) !== tree.sheet) {
        currentNode = tree.getLowestNode(startingPoint);
        legalNode = true;
    }
}

/**
 * If the node selected was legal, draws the node with the difference between the starting position
 * and the current position by altering the point of origin. If the node was a cut node also draws
 * all of the children with the same change in location.
 * @param event The mouse move event while in copyMulti mode
 */
export function copyMultiMouseMove(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawCut(tree.sheet, offset);
        if (currentNode instanceof CutNode) {
            if (validateChildren(currentNode, moveDifference)) {
                drawAltered(currentNode, legalColor(), moveDifference);
            } else {
                drawAltered(currentNode, illegalColor(), moveDifference);
            }
        } else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = new AtomNode(
                currentNode.identifier,
                new Point(
                    currentNode.origin.x + moveDifference.x - offset.x,
                    currentNode.origin.y + moveDifference.y - offset.y
                ),
                currentNode.width,
                currentNode.height
            );

            if (tree.canInsert(tempAtom)) {
                drawAtom(tempAtom, legalColor(), true);
            } else {
                drawAtom(tempAtom, illegalColor(), true);
            }
        }
    }
}

/**
 * If the current node is a cut node, and all of its children are in a legal position places it
 * in the current position. If it is not in a legal position, copy failed and nothing is inserted.
 * If the current node is an atom node and is in a legal position inserts it in the tree, otherwise
 * copy failed and nothing is inserted.
 * @param event the mouse up event while in copyMulti mode
 */
export function copyMultiMouseUp(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );

        if (currentNode instanceof CutNode) {
            if (validateChildren(currentNode, moveDifference)) {
                insertChildren(currentNode, moveDifference);
            }
        } else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = new AtomNode(
                currentNode.identifier,
                new Point(
                    currentNode.origin.x + moveDifference.x - offset.x,
                    currentNode.origin.y + moveDifference.y - offset.y
                ),
                currentNode.width,
                currentNode.height
            );

            if (tree.canInsert(tempAtom)) {
                tree.insert(tempAtom);
            }
        }
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCut(tree.sheet, offset);
    legalNode = false;
}

/**
 * If the mouse is moved outside of the canvas, sets wasOut to true.
 * Redraws the canvas to clear any drawings not part of the tree.
 */
export function copyMultiMouseOut() {
    legalNode = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCut(tree.sheet, offset);
}
