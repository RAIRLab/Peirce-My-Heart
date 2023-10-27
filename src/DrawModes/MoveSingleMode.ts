/**
 * File containing single node movement event handlers.
 * @author Dawn Moore
 */

import {Point} from "../AEG/Point";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {tree} from "../index";
import {offset} from "./DragMode";
import {drawCut, drawAtom, redrawTree} from "./DrawUtils";
import {legalColor, illegalColor} from "../Themes";
import {alterAtom, alterCut} from "./EditModeUtils";

//The initial point the user pressed down.
let startingPoint: Point;

//The node selected with the user mouse down.
let currentNode: CutNode | AtomNode | null = null;

//Whether or not the node is allowed to be moved (not the sheet).
let legalNode: boolean;

/**
 * Takes the point the user clicked and stores that for later use. If the lowest node containing
 * that point is not the sheet, then store that as currentNode and find that node's parent.
 * Removes the node from the parent and reinsert its children if it has any.
 * @param event The mouse down event while in moveSingle mode
 */
export function moveSingleMouseDown(event: MouseEvent) {
    startingPoint = new Point(event.x - offset.x, event.y - offset.y);
    currentNode = tree.getLowestNode(startingPoint);
    if (currentNode !== tree.sheet && currentNode !== null) {
        const currentParent = tree.getLowestParent(startingPoint);
        if (currentParent !== null) {
            currentParent.remove(startingPoint);
        }

        if (currentNode instanceof CutNode && currentNode.children.length !== 0) {
            //The cut node loses custody of its children so that those can still be redrawn.
            for (let i = 0; i < currentNode.children.length; i++) {
                tree.insert(currentNode.children[i]);
            }
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
 * entered into the current location. If yes draws the cut green otherwise red.
 * For atoms instead of altering the center it alters the origin position and does the same check.
 * @param event The mouse move event while in moveSingle mode
 */
export function moveSingleMouseMove(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );
        //If the node is a cut, and it has an ellipse, make a temporary cut and draw that.
        if (currentNode instanceof CutNode) {
            const tempCut: CutNode = alterCut(currentNode, moveDifference);

            redrawTree(tree);

            if (tree.canInsert(tempCut)) {
                drawCut(tempCut, legalColor());
            } else {
                drawCut(tempCut, illegalColor());
            }
        } //If the node is an atom, make a temporary atom and check legality, drawing that.
        else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = alterAtom(currentNode, moveDifference);

            redrawTree(tree);

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
 * If the new temporary node is in a legal position inserts the temporary cut as the replacement.
 * Otherwise enters the renters currentNode into the tree at the original point.
 * @param event The mouse up event while in moveSingle mode
 */
export function moveSingleMouseUp(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );
        if (currentNode instanceof CutNode) {
            const tempCut: CutNode = alterCut(currentNode, moveDifference);

            //If the new location is legal, insert the cut otherwise reinsert the cut we removed.
            if (tree.canInsert(tempCut)) {
                tree.insert(tempCut);
            } else {
                tree.insert(currentNode);
            }
        } else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = alterAtom(currentNode, moveDifference);

            //If the new location is legal, insert the atom, if not reinsert the atom we removed.
            if (tree.canInsert(tempAtom)) {
                tree.insert(tempAtom);
            } else {
                tree.insert(currentNode);
            }
        }
        redrawTree(tree);
    }
    legalNode = false;
}

/**
 * If the mouse is moved outside of the canvas, sets wasOut to true and reinserts the node.
 * Redraws the canvas.
 */
export function moveSingleMouseOut() {
    if (legalNode && currentNode !== null) {
        tree.insert(currentNode);
    }
    legalNode = false;
    redrawTree(tree);
}
