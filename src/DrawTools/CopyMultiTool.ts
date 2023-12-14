import * as EditModeUtils from "../SharedToolUtils/EditModeUtils";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {drawAtom, redrawTree} from "../SharedToolUtils/DrawUtils";
import {illegalColor, legalColor} from "../Themes";
import {offset} from "../SharedToolUtils/DragTool";
import {Point} from "../AEG/Point";
import {treeContext} from "../treeContext";

/**
 * Contains methods for copying and pasting one or more nodes at a time.
 *
 * @author Dawn Moore
 * @author Anusha Tiwari
 */

//First Point the user clicks.
let startingPoint: Point;

//Node in question.
let currentNode: CutNode | AtomNode | null = null;

//True if currentNode is not The Sheet of Assertion or null (i.e can be copied and pasted.)
let legalNode: boolean;

/**
 * Sets startingPoint according to the coordinates given by the incoming MouseEvent.
 * Then sets currentNode to the lowest node containing startingPoint.
 *
 * @param event Incoming MouseEvent.
 */
export function copyMultiMouseDown(event: MouseEvent) {
    startingPoint = new Point(event.x - offset.x, event.y - offset.y);
    currentNode = treeContext.tree.getLowestNode(startingPoint);
    if (currentNode !== treeContext.tree.sheet && currentNode !== null) {
        legalNode = true;
    } else {
        legalNode = false;
    }
}

/**
 * Alters currentNode according to the coordinates given by the incoming MouseEvent.
 * Then highlights the altered currentNode according to its and all its children's positions' validity.
 *
 * @param event Incoming MouseEvent.
 */
export function copyMultiMouseMove(event: MouseEvent) {
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
 * Alters the position of currentNode according to the coordinates given by the incoming MouseEvent.
 * Then inserts the altered currentNode if its position is valid.
 * Then inserts any children of currentNode if their positions are valid.
 * Otherwise inserts the original currentNode.
 *
 * @param event Incoming MouseEvent.
 */
export function copyMultiMouseUp(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );
        if (currentNode instanceof CutNode) {
            if (EditModeUtils.validateChildren(treeContext.tree, currentNode, moveDifference)) {
                EditModeUtils.insertChildren(currentNode, moveDifference);
            }
        } else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = EditModeUtils.alterAtom(currentNode, moveDifference);
            if (treeContext.tree.canInsert(tempAtom)) {
                treeContext.tree.insert(tempAtom);
            }
        }
    }
    redrawTree(treeContext.tree);
    legalNode = false;
}

/**
 * Sets legality to false.
 * Then redraws the Draw Mode AEGTree.
 */
export function copyMultiMouseOut() {
    legalNode = false;
    redrawTree(treeContext.tree);
}
