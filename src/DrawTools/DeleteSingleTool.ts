import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {drawAtom, drawCut, redrawTree} from "../SharedToolUtils/DrawUtils";
import {illegalColor} from "../Themes";
import {offset} from "../SharedToolUtils/DragTool";
import {Point} from "../AEG/Point";
import {readdChildren, reInsertNode} from "../SharedToolUtils/EditModeUtils";
import {treeContext} from "../treeContext";

/**
 * Contains methods for deleting one node at a time.
 *
 * When it is said that a node is "removed" in the documentation,
 * This means that it is removed from the Draw Mode AEGTree but visually is still present.
 *
 * @author Dawn Moore
 * @author Ryan Reilly
 */

//First Point the user clicks.
let startingPoint: Point;

//Node in question.
let currentNode: CutNode | AtomNode | null = null;

//True if currentNode is not The Sheet of Assertion or null (i.e can be removed.)
let legalNode: boolean;

/**
 * Sets startingPoint according to the coordinates given by the incoming MouseEvent.
 * Then the lowest node containing startingPoint is stored as currentNode if it is not The Sheet of Assertion or null.
 * Then currentNode is removed from the Draw Mode AEGTree, its children are readded, and it is highlighted as the illegal color.
 *
 * @param event Incoming MouseEvent.
 */
export function deleteSingleMouseDown(event: MouseEvent): void {
    startingPoint = new Point(event.x - offset.x, event.y - offset.y);
    currentNode = treeContext.tree.getLowestNode(startingPoint);
    if (currentNode !== null) {
        const currentParent = treeContext.tree.getLowestParent(startingPoint);
        if (currentParent !== null) {
            currentParent.remove(startingPoint);
        }

        if (
            currentNode instanceof CutNode &&
            currentNode.children.length !== 0 &&
            currentNode !== treeContext.tree.sheet
        ) {
            readdChildren(treeContext.tree, currentNode);
        }
        redrawTree(treeContext.tree);
        if (currentNode instanceof AtomNode) {
            drawAtom(currentNode, illegalColor(), true);
        } else {
            drawCut(currentNode, illegalColor());
        }
        legalNode = true;
    } else {
        legalNode = false;
    }
}

/**
 * Reinserts any nodes previously deleted, including whatever children of theirs were abandoned.
 * Then currentNode is to the lowest node containing the coordinates given by the incoming MouseEvent.
 * Then that new currentNode is removed, its children are inserted, and is highlighted as the illegal color.
 *
 * @param event Incoming MouseEvent.
 */
export function deleteSingleMouseMove(event: MouseEvent): void {
    if (legalNode && currentNode !== null && (currentNode as CutNode).ellipse !== null) {
        reInsertNode(treeContext.tree, currentNode);
    }
    const newPoint: Point = new Point(event.x - offset.x, event.y - offset.y);
    const newNode: CutNode | AtomNode | null = treeContext.tree.getLowestNode(newPoint);
    const currentParent = treeContext.tree.getLowestParent(newPoint);
    if (legalNode && currentNode !== null && currentParent !== null) {
        legalNode = true;
        redrawTree(treeContext.tree);
        if (newNode === null) {
            currentNode = null;
            legalNode = false;
        } else {
            currentParent.remove(newPoint);
            currentNode = newNode;
            if (currentNode instanceof CutNode && currentNode.children.length !== 0) {
                readdChildren(treeContext.tree, currentNode);
                currentNode.children = [];
            }
            redrawTree(treeContext.tree);
            if (currentNode instanceof AtomNode) {
                drawAtom(currentNode, illegalColor(), true);
            } else {
                drawCut(currentNode, illegalColor());
            }
        }
    }
}

/**
 * Sets currentNode according to the coordinates given by the incoming MouseEvent.
 * Then currentNode is deleted and all its children are readded to the Draw Mode AEGTree.
 * Then the currentNode is set to null and legality is set to false.
 *
 * @param event Incoming MouseEvent.
 */
export function deleteSingleMouseUp(event: MouseEvent): void {
    const newPoint: Point = new Point(event.x - offset.x, event.y - offset.y);
    if (legalNode) {
        const currentNode = treeContext.tree.getLowestNode(newPoint);
        if (currentNode !== null && currentNode instanceof CutNode) {
            currentNode.remove(newPoint);
        }
        if (
            currentNode !== treeContext.tree.sheet &&
            currentNode instanceof CutNode &&
            currentNode.children.length !== 0
        ) {
            readdChildren(treeContext.tree, currentNode);
        }
        redrawTree(treeContext.tree);
    }

    currentNode = null;
    legalNode = false;
}

/**
 * Reinserts the original currentNode, sets currentNode to null, sets legality to false and redraws the Draw Mode AEGTree.
 */
export function deleteSingleMouseOut(): void {
    if (legalNode && currentNode !== null) {
        reInsertNode(treeContext.tree, currentNode);
    }
    currentNode = null;
    legalNode = false;
    redrawTree(treeContext.tree);
}
