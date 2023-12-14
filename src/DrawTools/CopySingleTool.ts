import {alterAtom, alterCut} from "../SharedToolUtils/EditModeUtils";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {drawAtom, drawCut, redrawTree} from "../SharedToolUtils/DrawUtils";
import {illegalColor, legalColor} from "../Themes";
import {offset} from "../SharedToolUtils/DragTool";
import {Point} from "../AEG/Point";
import {treeContext} from "../treeContext";

/**
 * Contains methods for copy and pasting one node at a time.
 * When it is said that a node is "removed" in the documentation,
 * This means that it is removed from the Draw Mode AEGTree but visually is still present.
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
 * Then removes the lowest node containing startingPoint.
 *
 * @param event Incoming MouseEvent.
 */
export function copySingleMouseDown(event: MouseEvent) {
    startingPoint = new Point(event.x - offset.x, event.y - offset.y);
    const realNode: CutNode | AtomNode | null = treeContext.tree.getLowestNode(startingPoint);
    const moveDifference: Point = new Point(event.x - startingPoint.x, event.y - startingPoint.y);
    if (realNode !== treeContext.tree.sheet && realNode !== null) {
        if (realNode instanceof CutNode) {
            currentNode = alterCut(realNode, moveDifference);
            currentNode.children = [];
        } else if (realNode instanceof AtomNode) {
            currentNode = realNode;
        }
        legalNode = true;
    } else {
        legalNode = false;
    }
}

/**
 * Alters currentNode according to the coordinates given by the incoming MouseEvent.
 * Then highlights the altered currentNode according to its position's validity.
 *
 * @param event Incoming MouseEvent.
 */
export function copySingleMouseMove(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );
        if (currentNode instanceof CutNode) {
            const tempCut: CutNode = alterCut(currentNode, moveDifference);
            redrawTree(treeContext.tree);
            const color = treeContext.tree.canInsert(tempCut) ? legalColor() : illegalColor();
            drawCut(tempCut, color);
        } else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = alterAtom(currentNode, moveDifference);
            redrawTree(treeContext.tree);
            const color = treeContext.tree.canInsert(tempAtom) ? legalColor() : illegalColor();
            drawAtom(tempAtom, color, true);
        }
    }
}

/**
 * Alters the position of currentNode according to the coordinates given by the incoming MouseEvent.
 * Then inserts the altered currentNode if its position is valid.
 * Otherwise inserts the original currentNode.
 *
 * @param event Incoming MouseEvent.
 */
export function copySingleMouseUp(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );
        if (currentNode instanceof CutNode && currentNode.ellipse !== null) {
            const tempCut: CutNode = alterCut(currentNode, moveDifference);
            if (treeContext.tree.canInsert(tempCut)) {
                treeContext.tree.insert(tempCut);
            }
        } else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = alterAtom(currentNode, moveDifference);
            if (treeContext.tree.canInsert(tempAtom)) {
                treeContext.tree.insert(tempAtom);
            }
        }
        redrawTree(treeContext.tree);
    }
    legalNode = false;
}

/**
 * Sets legality to false.
 * Then redraws the Draw Mode AEGTree.
 */
export function copySingleMouseOut() {
    legalNode = false;
    redrawTree(treeContext.tree);
}
