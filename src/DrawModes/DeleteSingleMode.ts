/**
 * Contains logic for deleting one node.
 * @author Ryan Reilly
 * @author Dawn Moore
 */

import {Point} from "../AEG/Point";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {offset} from "./DragMode";
import {drawAtom, drawCut, redrawTree} from "./DrawUtils";
import {tree} from "../index";
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
    currentNode = tree.getLowestNode(startingPoint);

    if (currentNode !== tree.sheet && currentNode !== null) {
        legalNode = true;
        if (currentNode instanceof AtomNode) {
            drawAtom(currentNode, illegalColor(), true);
        } else {
            drawCut(currentNode, illegalColor());
        }
    }
}

/**
 * If the user clicks on a node to delete it, but moves their mouse away,
 * The node will not be deleted. Whichever node lowest on the tree now contains the MouseEvent's
 * Point will be set to the node to be deleted.
 * @param event The mouse move event
 */
export function deleteSingleMouseMove(event: MouseEvent) {
    const newPoint: Point = new Point(event.x - offset.x, event.y - offset.y);
    const newNode: CutNode | AtomNode | null = tree.getLowestNode(newPoint);
    if (currentNode !== null && currentNode !== newNode) {
        legalNode = true;
        redrawTree(tree);
        if (newNode === tree.sheet || newNode === null) {
            currentNode = null;
            legalNode = false;
        } else {
            currentNode = newNode;
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
        const currentParent = tree.getLowestParent(newPoint);
        if (currentParent !== null) {
            currentParent.remove(newPoint);
        }
        if (currentNode instanceof CutNode && currentNode.children.length !== 0) {
            //The cut node loses custody of its children so that those can still be redrawn.
            for (let i = 0; i < currentNode.children.length; i++) {
                tree.insert(currentNode.children[i]);
            }
        }
    }
    redrawTree(tree);
    currentNode = null;
    legalNode = false;
}

/**
 * If the mouse leaves the canvas, reset data back to defaults.
 */
export function deleteSingleMouseOut() {
    currentNode = null;
    legalNode = false;
}
