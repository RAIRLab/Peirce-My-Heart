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
 * @author Dawn Moore
 * @author Ryan Reilly
 */

//First Point the user clicks.
let startingPoint: Point;

//Node in question.
let currentNode: CutNode | AtomNode | null = null;

//True if this node is not The Sheet of Assertion (i.e can be moved.)
let legalNode: boolean;

/**
 * Sets startingPoint according to the coordinate given by the incoming MouseEvent.
 * Then the node at startingPoint is stored as currentNode if it is not The Sheet of Assertion.
 * Then currentNode is removed from the Draw Mode AEGTree, its children are readded, and it is highlighted as the illegal color.
 *
 * @param event Incoming MouseEvent.
 */
export function deleteSingleMouseDown(event: MouseEvent) {
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
 * Then currentNode is set according to the coordinates given by the incoming MouseEvent.
 * Then that new currentNode is removed, its children are inserted, and is highlighted as the illegal color.
 *
 * @param event Incoming MouseEvent.
 */
export function deleteSingleMouseMove(event: MouseEvent) {
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
 *
 * @param event Incoming MouseEvent.
 */
export function deleteSingleMouseUp(event: MouseEvent) {
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
 * Marks legality as false, sets currentNode to null, reinserts the original currentNode and redraws the Draw Mode AEGTree.
 */
export function deleteSingleMouseOut() {
    if (legalNode && currentNode !== null) {
        reInsertNode(treeContext.tree, currentNode);
    }
    currentNode = null;
    legalNode = false;
    redrawTree(treeContext.tree);
}
