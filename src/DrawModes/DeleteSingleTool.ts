/**
 * Contains logic for deleting one node.
 * @author Ryan Reilly
 * @author Dawn Moore
 */

import {Point} from "../AEG/Point";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {offset} from "../SharedToolUtils/DragTool";
import {drawAtom, drawCut, redrawTree} from "../SharedToolUtils/DrawUtils";
import {treeContext} from "../treeContext";
import {illegalColor} from "../Themes";
import {readdChildren, reInsertNode} from "../SharedToolUtils/EditModeUtils";

//The initial point the user pressed down.
let startingPoint: Point;

//The node selected with the user mouse down.
let currentNode: CutNode | AtomNode | null = null;

//Whether or not the node is allowed to be moved (not the sheet).
let legalNode: boolean;

/**
 * Takes the Point the user clicked and stores it.
 * If the lowest node containing that Point isn't the Sheet of Assertion,
 * That node is stored as currentNode.
 * currentNode is marked with the "illegal" color while the user holds it.
 * @param event The event from which we will get the Point
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
 * If the user clicks on a node to delete it, but moves their mouse away,
 * The node will not be deleted. Whichever node lowest on the tree now contains the MouseEvent's
 * Point will be set to the node to be deleted.
 * @param event The mouse move event
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
 * Removes currentNode and sets all data back to default values.
 * @param event The mouse up event
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
 * If the mouse leaves the canvas, reset data back to defaults.
 */
export function deleteSingleMouseOut() {
    if (legalNode && currentNode !== null) {
        reInsertNode(treeContext.tree, currentNode);
    }
    currentNode = null;
    legalNode = false;
    redrawTree(treeContext.tree);
}
