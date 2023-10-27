/**
 * File containing multi node movement event handlers.
 * @author Dawn Moore
 */

import {Point} from "../AEG/Point";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {tree} from "../index";
import {offset} from "./DragMode";
import {drawAtom, redrawTree} from "./DrawUtils";
import {legalColor, illegalColor} from "../Themes";
import {validateChildren, drawAltered, insertChildren, alterAtom} from "./EditModeUtils";

//The initial point the user pressed down.
let startingPoint: Point;

//The current node and its children we will be moving.
let currentNode: CutNode | AtomNode | null = null;

//Whether or not the node is allowed to be moved (not the sheet).
let legalNode: boolean;

/**
 * Takes the starting point and sets the lowest node containing that point that is not the sheet to
 * the current node. Removes that node from its parent.
 * @param event The mouse down event while in moveMulti mode.
 */
export function moveMultiMouseDown(event: MouseEvent) {
    startingPoint = new Point(event.x - offset.x, event.y - offset.y);
    currentNode = tree.getLowestNode(startingPoint);
    if (currentNode !== tree.sheet && currentNode !== null) {
        const currentParent = tree.getLowestParent(startingPoint);
        if (currentParent !== null) {
            currentParent.remove(startingPoint);
        }
        legalNode = true;
    } else {
        legalNode = false;
    }
}

/**
 * If the node selected was legal, draws the node with the difference between the starting position
 * and the current position by altering the point of origin. If the node was a cut node also draws
 * all of the children with the same change in location.
 * @param event The mouse move event while in moveMulti mode
 */
export function moveMultiMouseMove(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );

        redrawTree(tree);
        if (currentNode instanceof CutNode) {
            const color = validateChildren(currentNode, moveDifference) ? legalColor() : illegalColor()
            drawAltered(currentNode, color, moveDifference);
        } else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = alterAtom(currentNode, moveDifference);
            const color = tree.canInsert(tempAtom) ? legalColor() : illegalColor();
            drawAtom(tempAtom, color, true);
        }
    }
}

/**
 * If the current node is a cut node, and all of its children are in a legal position places it
 * in the current position. If it is not in a legal position returns the original node to the tree.
 * If the current node is an atom node and is in a legal position adds it to the tree, otherwise
 * readds the original node in the original place.
 * @param event the mouse up event while in moveMulti mode
 */
export function moveMultiMouseUp(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );

        if (currentNode instanceof CutNode) {
            if (validateChildren(currentNode, moveDifference)) {
                insertChildren(currentNode, moveDifference);
            } else {
                tree.insert(currentNode);
            }
        } else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = alterAtom(currentNode, moveDifference);

            if (tree.canInsert(tempAtom)) {
                tree.insert(tempAtom);
            } else {
                tree.insert(currentNode);
            }
        }
    }
    redrawTree(tree);
    legalNode = false;
}

/**
 * If the current node is a legal node returns it to the original position.
 * Redraws the canvas to clear any drawings not part of the tree.
 */
export function moveMultiMouseOut() {
    if (legalNode && currentNode !== null) {
        tree.insert(currentNode);
    }
    legalNode = false;
    redrawTree(tree);
}
