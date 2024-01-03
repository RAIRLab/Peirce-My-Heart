import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {highlightNode, redrawTree} from "../SharedToolUtils/DrawUtils";
import {illegalColor} from "../Themes";
import {offset} from "../SharedToolUtils/DragTool";
import {Point} from "../AEG/Point";
import {reInsertNode} from "../SharedToolUtils/EditModeUtils";
import {TreeContext} from "../TreeContext";

/**
 * Contains methods for deleting one or more nodes at a time.
 *
 * When it is said that nodes are "removed" in the documentation,
 * This means that they are removed from the Draw Mode AEGTree but visually are still present.
 *
 * @author Dawn Moore
 * @author Ryan R
 */

//First Point the user clicks.
let startingPoint: Point;

//Node in question.
let currentNode: CutNode | AtomNode | null = null;

//True if currentNode is not null.
let legalNode: boolean;

/**
 * Sets startingPoint according to the coordinates given by the incoming MouseEvent.
 * Then currentNode is set to the lowest node containing startingPoint.
 * Then currentNode and all its children are removed from the Draw Mode AEGTree and are highlighted the illegal color.
 * Then removes all the children of currentNode if currentNode is The Sheet of Assertion.
 *
 * @param event Incoming MouseEvent.
 */
export function deleteMultiMouseDown(event: MouseEvent): void {
    startingPoint = new Point(event.x - offset.x, event.y - offset.y);
    currentNode = TreeContext.tree.getLowestNode(startingPoint);

    if (currentNode !== null) {
        const currentParent = TreeContext.tree.getLowestParent(startingPoint);
        if (currentParent !== null) {
            currentParent.remove(startingPoint);
        } else {
            currentNode = TreeContext.tree.sheet.copy();
            TreeContext.tree.clear();
        }
        legalNode = true;
        redrawTree(TreeContext.tree);
        highlightNode(currentNode, illegalColor());
    }
}

/**
 * Reinserts any nodes previously deleted, including whatever children of its were abandoned.
 * Then currentNode is set to the lowest node containing the coordinates given by the incoming MouseEvent.
 * Then that new currentNode and all its children are removed and highlighted as the illegal color.
 *
 * @param event Incoming MouseEvent.
 */
export function deleteMultiMouseMove(event: MouseEvent): void {
    if (legalNode && currentNode !== null) {
        reInsertNode(TreeContext.tree, currentNode);
    }
    const newPoint: Point = new Point(event.x - offset.x, event.y - offset.y);
    const newNode: CutNode | AtomNode | null = TreeContext.tree.getLowestNode(newPoint);
    const currentParent = TreeContext.tree.getLowestParent(newPoint);
    if (legalNode && currentNode !== null && currentParent !== null) {
        legalNode = true;
        if (newNode === null) {
            currentNode = null;
            legalNode = false;
        } else {
            currentParent.remove(newPoint);
            currentNode = newNode;
            legalNode = true;
            redrawTree(TreeContext.tree);
            highlightNode(currentNode, illegalColor());
        }
    } else if (legalNode && currentParent === null) {
        currentNode = TreeContext.tree.sheet.copy();
        TreeContext.tree.clear();
        redrawTree(TreeContext.tree);
        highlightNode(currentNode, illegalColor());
    }
}

/**
 * Sets currentNode according to the lowest node containing the coordinates given by the incoming MouseEvent.
 * Then currentNode and all its children are deleted from the Draw Mode AEGTree.
 * Then the currentNode is set to null.
 * Then legality is set to false.
 *
 * @param event Incoming MouseEvent.
 */
export function deleteMultiMouseUp(event: MouseEvent): void {
    const newPoint: Point = new Point(event.x - offset.x, event.y - offset.y);
    if (legalNode) {
        const currentNode = TreeContext.tree.getLowestNode(newPoint);
        if (currentNode !== null && currentNode instanceof CutNode) {
            currentNode.remove(newPoint);
        } else {
            TreeContext.tree.clear();
        }
        redrawTree(TreeContext.tree);
    }
    currentNode = null;
    legalNode = false;
}

/**
 * Reinserts the original currentNode if legal.
 * Then sets currentNode to null.
 * Then sets legality to false.
 * Then redraws the Draw Mode AEGTree.
 */
export function deleteMultiMouseOut(): void {
    if (legalNode && currentNode !== null) {
        reInsertNode(TreeContext.tree, currentNode);
    }
    currentNode = null;
    legalNode = false;
    redrawTree(TreeContext.tree);
}
