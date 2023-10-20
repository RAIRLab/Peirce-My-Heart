/**
 * File containing single node movement event handlers.
 * @author Dawn Moore
 */

import {Point} from "./AEG/Point";
import {AtomNode} from "./AEG/AtomNode";
import {CutNode} from "./AEG/CutNode";
import {redrawCut, tree} from "./index";
import {offset} from "./DragMode";
import {Ellipse} from "./AEG/Ellipse";
import {drawEllipse} from "./CutMode";
import {drawAtom} from "./AtomMode";

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
let currentNode: CutNode | AtomNode;

//The new position of the origin of the atom, or the center of the ellipse.
let alteredOrigin: Point;

//Whether or not the node is allowed to be moved (not the sheet).
let legalNode: boolean;

//Tracks if the mouse has ever left canvas disallowing future movements.
let wasOut: boolean;

/**
 * Takes the point the user clicked and stores that for later use. If the lowest node containing
 * that point is not the sheet, then store that as currentNode and find that node's parent.
 * Removes the node from the parent and reinsert its children if it has any.
 * @param event The mouse down event while in moveSingle mode
 */
export function moveSingleMouseDown(event: MouseEvent) {
    startingPoint = new Point(event.x - offset.x, event.y - offset.y);
    if (tree.getLowestNode(startingPoint) !== tree.sheet) {
        currentNode = tree.getLowestNode(startingPoint);
        const currentParent = tree.getLowestParent(startingPoint);
        currentParent.remove(startingPoint);
        if (currentNode instanceof CutNode && currentNode.children.length !== 0) {
            //The cut node loses custody of its children so that those can still be redrawn.
            reInsert(currentNode.children);
            currentNode.children = [];
        }
        wasOut = false;
        legalNode = true;
    }
}

/**
 * If the node is legal, and it wasn't out compare the difference between the start and the current.
 * If the node is a cut, creates a new cut with the altered center and checks to see if it can be
 * entered into the current location. If yes draws the cut green otherwise red.
 * For atoms instead of altering the center it alters the origin position and does the same check.
 * @param event The mouse move event while in moveSingle mode
 */
export function moveSingleMouseMove(event: MouseEvent) {
    if (legalNode && !wasOut) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );
        //If the node is a cut, and it has an ellipse, make a temporary cut and draw that.
        if (currentNode instanceof CutNode && currentNode.ellipse !== null) {
            alteredOrigin = new Point(
                currentNode.ellipse.center.x + moveDifference.x - offset.x,
                currentNode.ellipse.center.y + moveDifference.y - offset.y
            );

            const tempCut: CutNode = new CutNode(
                new Ellipse(alteredOrigin, currentNode.ellipse.radiusX, currentNode.ellipse.radiusY)
            );

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            redrawCut(tree.sheet, offset);

            if (tree.canInsert(tempCut)) {
                drawEllipse(tempCut, "#00FF00");
            } else {
                drawEllipse(tempCut, "#FF0000");
            }
        } //If the node is an atom, make a temporary atom and check legality, drawing that.
        else if (currentNode instanceof AtomNode) {
            alteredOrigin = new Point(
                currentNode.origin.x + moveDifference.x - offset.x,
                currentNode.origin.y + moveDifference.y - offset.y
            );

            const tempAtom: AtomNode = new AtomNode(
                currentNode.identifier,
                alteredOrigin,
                currentNode.width,
                currentNode.height
            );

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            redrawCut(tree.sheet, offset);

            if (tree.canInsert(tempAtom)) {
                drawAtom(tempAtom, "#00FF00", true);
            } else {
                drawAtom(tempAtom, "#FF0000", true);
            }
        }
    }
}

/**
 * If the node is legal, and the mouse has not been out compares the start and the current.
 * If the new temporary node is in a legal position inserts the temporary cut as the replacement.
 * Otherwise enters the renters currentNode into the tree at the original point.
 * @param event The mouse up event while in moveSingle mode
 */
export function moveSingleMouseUp(event: MouseEvent) {
    if (legalNode && !wasOut) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );
        //
        if (currentNode instanceof CutNode && currentNode.ellipse !== null) {
            alteredOrigin = new Point(
                currentNode.ellipse.center.x + moveDifference.x - offset.x,
                currentNode.ellipse.center.y + moveDifference.y - offset.y
            );

            const tempCut: CutNode = new CutNode(
                new Ellipse(alteredOrigin, currentNode.ellipse.radiusX, currentNode.ellipse.radiusY)
            );

            //If the new location is legal, insert the cut otherwise reinsert the cut we removed.
            if (tree.canInsert(tempCut)) {
                tree.insert(tempCut);
            } else {
                tree.insert(currentNode);
            }
        } else if (currentNode instanceof AtomNode) {
            alteredOrigin = new Point(
                currentNode.origin.x + moveDifference.x - offset.x,
                currentNode.origin.y + moveDifference.y - offset.y
            );

            const tempAtom: AtomNode = new AtomNode(
                currentNode.identifier,
                alteredOrigin,
                currentNode.width,
                currentNode.height
            );

            //If the new location is legal, insert the atom, if not reinsert the atom we removed.
            if (tree.canInsert(tempAtom)) {
                tree.insert(tempAtom);
            } else {
                tree.insert(currentNode);
            }
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawCut(tree.sheet, offset);
    }
    legalNode = false;
}

/**
 * If the mouse is moved outside of the canvas, sets wasOut to true and reinserts the node.
 * Redraws the canvas.
 */
export function moveSingleMouseOut() {
    wasOut = true;
    if (legalNode) {
        tree.insert(currentNode);
    }
    legalNode = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCut(tree.sheet, offset);
}

/**
 * Inserts the children of a removed node back into the tree.
 * @param children The children of the removed cut node
 */
function reInsert(children: (AtomNode | CutNode)[]) {
    for (let i = 0; i < children.length; i++) {
        tree.insert(children[i]);
    }
}
