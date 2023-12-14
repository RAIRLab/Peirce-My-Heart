import {alterAtom, alterCut} from "../SharedToolUtils/EditModeUtils";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {drawAtom, drawCut, redrawTree} from "../SharedToolUtils/DrawUtils";
import {illegalColor, legalColor} from "../Themes";
import {offset} from "../SharedToolUtils/DragTool";
import {Point} from "../AEG/Point";
import {treeContext} from "../treeContext";

/**
 * Contains methods for moving one node at a time.
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
 * Then removes the lowest node containing startingPoint, reinserts its children and highlights currentNode the legal color.
 *
 * @param event Incoming MouseEvent.
 */
export function moveSingleMouseDown(event: MouseEvent) {
    startingPoint = new Point(event.x - offset.x, event.y - offset.y);
    currentNode = treeContext.tree.getLowestNode(startingPoint);
    if (currentNode !== treeContext.tree.sheet && currentNode !== null) {
        const currentParent = treeContext.tree.getLowestParent(startingPoint);
        if (currentParent !== null) {
            currentParent.remove(startingPoint);
        }

        if (currentNode instanceof CutNode && currentNode.children.length !== 0) {
            for (let i = 0; i < currentNode.children.length; i++) {
                treeContext.tree.insert(currentNode.children[i]);
            }
            currentNode.children = [];
        }
        legalNode = true;

        redrawTree(treeContext.tree);
        if (currentNode instanceof AtomNode) {
            drawAtom(currentNode, legalColor(), true);
        } else {
            drawCut(currentNode as CutNode, legalColor());
        }
    } else {
        legalNode = false;
    }
}

/**
 * Alters currentNode according to the coordinates given by the incoming MouseEvent.
 * Then highlights currentNode according to the legality of its position.
 *
 * @param event Incoming MouseEvent.
 */
export function moveSingleMouseMove(event: MouseEvent) {
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
 * Alters currentNode according to the coordinates given by the incoming MouseEvent.
 * Then inserts currentNode if its altering is legal. Reinserts the original currentNode otherwise.
 *
 * @param event Incoming MouseEvent.
 */
export function moveSingleMouseUp(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );
        if (currentNode instanceof CutNode) {
            const tempCut: CutNode = alterCut(currentNode, moveDifference);
            if (treeContext.tree.canInsert(tempCut)) {
                treeContext.tree.insert(tempCut);
            } else {
                treeContext.tree.insert(currentNode);
            }
        } else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = alterAtom(currentNode, moveDifference);
            if (treeContext.tree.canInsert(tempAtom)) {
                treeContext.tree.insert(tempAtom);
            } else {
                treeContext.tree.insert(currentNode);
            }
        }
        redrawTree(treeContext.tree);
    }
    legalNode = false;
}

/**
 * Sets wasOut to true and reinserts the original currentNode.
 * Then redraws the canvas.
 */
export function moveSingleMouseOut() {
    if (legalNode && currentNode !== null) {
        treeContext.tree.insert(currentNode);
    }
    legalNode = false;
    redrawTree(treeContext.tree);
}
