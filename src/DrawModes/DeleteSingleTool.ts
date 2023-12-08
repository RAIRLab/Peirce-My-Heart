/**
 * Contains logic for deleting one node.
 * @author Ryan Reilly
 * @author Dawn Less
 */

import {Point} from "../AEG/Point";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {offset} from "./DragTool";
import {drawAtom, drawCut, redrawTree} from "./DrawUtils";
import {treeContext} from "../treeContext";
import {illegalColor} from "../Themes";

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
    if (currentNode !== treeContext.tree.sheet && currentNode !== null) {
        const currentParent = treeContext.tree.getLowestParent(startingPoint);
        if (currentParent !== null) {
            currentParent.remove(startingPoint);
        }

        if (currentNode instanceof CutNode && currentNode.children.length !== 0) {
            //The cut node loses custody of its children so that those can still be redrawn.
            for (let i = 0; i < currentNode.children.length; i++) {
                treeContext.tree.insert(currentNode.children[i]);
            }
            currentNode.children = [];
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
        if (treeContext.tree.canInsert(currentNode)) {
            treeContext.tree.insert(currentNode);
            if (currentNode instanceof CutNode) {
                readdChildren(currentNode);
            }
            redrawTree(treeContext.tree);
        }
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
            currentNode = newNode;

            if (currentNode instanceof CutNode && currentNode.children.length !== 0) {
                for (let i = 0; i < currentNode.children.length; i++) {
                    treeContext.tree.insert(currentNode.children[i]);
                }
            }
            currentParent.remove(newPoint);
            redrawTree(treeContext.tree);
            if (currentNode instanceof AtomNode) {
                drawAtom(currentNode, illegalColor(), true);
                console.log("highlighting atom red in mouse move");
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
        const currentParent = treeContext.tree.getLowestNode(newPoint);
        if (currentParent !== null && currentParent instanceof CutNode) {
            currentParent.remove(newPoint);
        }
        if (
            currentNode !== treeContext.tree.sheet &&
            currentNode instanceof CutNode &&
            currentNode.children.length !== 0
        ) {
            //The cut node loses custody of its children so that those can still be redrawn.
            for (let i = 0; i < currentNode.children.length; i++) {
                treeContext.tree.insert(currentNode.children[i]);
            }
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
    currentNode = null;
    legalNode = false;
    redrawTree(treeContext.tree);
}

/**
 * Readds children of a parent CutNode.
 * @param parentCut Parent CutNode
 */
function readdChildren(parentCut: CutNode) {
    for (let i = 0; i < parentCut.children.length; i++) {
        if (treeContext.tree.canInsert(parentCut.children[i])) {
            treeContext.tree.insert(parentCut.children[i]);
        }
    }
}
