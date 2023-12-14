import * as EditModeUtils from "../SharedToolUtils/EditModeUtils";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {drawAtom, highlightNode, redrawTree} from "../SharedToolUtils/DrawUtils";
import {illegalColor, legalColor} from "../Themes";
import {offset} from "../SharedToolUtils/DragTool";
import {Point} from "../AEG/Point";
import {treeContext} from "../treeContext";

/**
 * Contains methods for moving one or more nodes at a time.
 * When it is said that nodes are "removed" in the documentation,
 * This means that they are removed from the Draw Mode AEGTree but visually are still present.
 *
 * @author Dawn Moore
 * @author Anusha Tiwari
 */

//First Point the user clicks.
let startingPoint: Point;

//Node in question.
let currentNode: CutNode | AtomNode | null = null;

//True if currentNode is not The Sheet of Assertion or null (i.e can be moved.)
let legalNode: boolean;

/**
 * Sets startingPoint according to the coordinates given by the incoming MouseEvent.
 * Then removes the lowest node containing startingPoint.
 *
 * @param event Incoming MouseEvent.
 */
export function moveMultiMouseDown(event: MouseEvent) {
    startingPoint = new Point(event.x - offset.x, event.y - offset.y);
    currentNode = treeContext.tree.getLowestNode(startingPoint);
    if (currentNode !== treeContext.tree.sheet && currentNode !== null) {
        const currentParent = treeContext.tree.getLowestParent(startingPoint);
        if (currentParent !== null) {
            currentParent.remove(startingPoint);
        }
        legalNode = true;
        redrawTree(treeContext.tree);
        highlightNode(currentNode, legalColor());
    } else {
        legalNode = false;
    }
}

/**
 * Draws an altered currentNode according to the coordinates given by the incoming MouseEvent.
 * Then highlights currentNode according to the legality of its position.
 *
 * @param event The mouse move event while in moveMulti mode
 */
export function moveMultiMouseMove(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );

        redrawTree(treeContext.tree);
        if (currentNode instanceof CutNode) {
            const color = EditModeUtils.validateChildren(
                treeContext.tree,
                currentNode,
                moveDifference
            )
                ? legalColor()
                : illegalColor();
            EditModeUtils.drawAltered(currentNode, color, moveDifference);
        } else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = EditModeUtils.alterAtom(currentNode, moveDifference);
            const color = treeContext.tree.canInsert(tempAtom) ? legalColor() : illegalColor();
            drawAtom(tempAtom, color, true);
        }
    }
}

/**
 * Sets currentNode to the coordinates given by the incoming MouseEvent.
 * Then Inserts currentNode into the Draw Mode AEGTree if the position of it and all its children is legal.
 * Otherwise inserts the original currentNode.
 * Then redraws the tree.
 *
 * @param event Incoming MouseEvent.
 */
export function moveMultiMouseUp(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );

        if (currentNode instanceof CutNode) {
            if (EditModeUtils.validateChildren(treeContext.tree, currentNode, moveDifference)) {
                EditModeUtils.insertChildren(currentNode, moveDifference);
            } else {
                treeContext.tree.insert(currentNode);
            }
        } else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = EditModeUtils.alterAtom(currentNode, moveDifference);

            if (treeContext.tree.canInsert(tempAtom)) {
                treeContext.tree.insert(tempAtom);
            } else {
                treeContext.tree.insert(currentNode);
            }
        }
    }
    redrawTree(treeContext.tree);
    legalNode = false;
}

/**
 * Sets wasOut to true and reinserts the original currentNode and all its children.
 * Then redraws the canvas.
 */
export function moveMultiMouseOut() {
    if (legalNode && currentNode !== null) {
        treeContext.tree.insert(currentNode);
    }
    legalNode = false;
    redrawTree(treeContext.tree);
}
