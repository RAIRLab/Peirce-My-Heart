import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {highlightNode, redrawTree} from "../SharedToolUtils/DrawUtils";
import {illegalColor} from "../Themes";
import {offset} from "../SharedToolUtils/DragTool";
import {Point} from "../AEG/Point";
import {reInsertNode} from "../SharedToolUtils/EditModeUtils";
import {treeContext} from "../treeContext";

/**
 * Contains methods for deleting multiple nodes at once.
 * When it is said that nodes are "removed" in the documentation,
 * This means that they are removed from the Draw Mode AEGTree but visually are still present.
 *
 * @author Dawn Moore
 * @author Ryan Reilly
 */

//First Point the user clicks.
let startingPoint: Point;

//Node in question.
let currentNode: CutNode | AtomNode | null = null;

//True if currentNode is not null.
let legalNode: boolean;

/**
 * Sets startingPoint according to the coordinate given by the incoming MouseEvent.
 * Then the node at startingPoint is stored as currentNode.
 * Then currentNode and all its children are removed from the Draw Mode AEGTree and are highlighted as the illegal color.
 * If currentNode is The Sheet of Assertion, all its children are removed.
 *
 * @param event Incoming MouseEvent.
 */
export function deleteMultiMouseDown(event: MouseEvent) {
    startingPoint = new Point(event.x - offset.x, event.y - offset.y);
    currentNode = treeContext.tree.getLowestNode(startingPoint);

    if (currentNode !== null) {
        const currentParent = treeContext.tree.getLowestParent(startingPoint);
        if (currentParent !== null) {
            currentParent.remove(startingPoint);
        } else {
            currentNode = treeContext.tree.sheet.copy();
            treeContext.tree.clear();
        }
        legalNode = true;
        redrawTree(treeContext.tree);
        highlightNode(currentNode, illegalColor());
    }
}

/**
 * Reinserts any nodes previously deleted, including whatever children of theirs were abandoned.
 * Then currentNode is set according to the coordinates given by the incoming MouseEvent.
 * Then that new currentNode and all its children are removed and highlighted as the illegal color.
 *
 * @param event Incoming MouseEvent.
 */
export function deleteMultiMouseMove(event: MouseEvent) {
    if (legalNode && currentNode !== null) {
        reInsertNode(treeContext.tree, currentNode);
    }
    const newPoint: Point = new Point(event.x - offset.x, event.y - offset.y);
    const newNode: CutNode | AtomNode | null = treeContext.tree.getLowestNode(newPoint);
    const currentParent = treeContext.tree.getLowestParent(newPoint);
    if (legalNode && currentNode !== null && currentParent !== null) {
        legalNode = true;
        if (newNode === null) {
            currentNode = null;
            legalNode = false;
        } else {
            currentParent.remove(newPoint);
            currentNode = newNode;
            legalNode = true;
            redrawTree(treeContext.tree);
            highlightNode(currentNode, illegalColor());
        }
    } else if (legalNode && currentParent === null) {
        currentNode = treeContext.tree.sheet.copy();
        treeContext.tree.clear();
        redrawTree(treeContext.tree);
        highlightNode(currentNode, illegalColor());
    }
}

/**
 * Sets currentNode according to the coordinates given by the incoming MouseEvent.
 * Then currentNode and all its children are deleted from the Draw Mode AEGTree.
 * Then the currentNode is set to null and legality is set to false.
 *
 * @param event Incoming MouseEvent.
 */
export function deleteMultiMouseUp(event: MouseEvent) {
    const newPoint: Point = new Point(event.x - offset.x, event.y - offset.y);
    if (legalNode) {
        const currentNode = treeContext.tree.getLowestNode(newPoint);
        if (currentNode !== null && currentNode instanceof CutNode) {
            currentNode.remove(newPoint);
        } else {
            treeContext.tree.clear();
        }
        redrawTree(treeContext.tree);
    }
    currentNode = null;
    legalNode = false;
}

/**
 * Reinserts the original currentNode, sets currentNode to null, sets legality to false and redraws the Draw Mode AEGTree.
 */
export function deleteMultiMouseOut() {
    if (legalNode && currentNode !== null) {
        reInsertNode(treeContext.tree, currentNode);
    }
    currentNode = null;
    legalNode = false;
    redrawTree(treeContext.tree);
}
