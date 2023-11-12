/**
 * Inference rule for erasure
 * @author Dawn Moore
 */

import {Point} from "../AEG/Point";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {redrawTree} from "../DrawModes/DrawUtils";
import {treeContext} from "../treeContext";
import {illegalColor} from "../Themes";
import {offset} from "../DrawModes/DragTool";
import {highlightChildren} from "../DrawModes/EditModeUtils";

//The node selected with the user mouse down.
let currentNode: CutNode | AtomNode | null = null;

//Whether or not the node is allowed to be moved (not the sheet).
let legalNode: boolean;

/**
 * Captures the current location, and the node linked with that location.
 * Determines if it is a legal node.
 * @param event The mouse down event while using the erasure tool
 */
export function erasureMouseDown(event: MouseEvent) {
    const currentPoint: Point = new Point(event.x - offset.x, event.y - offset.y);
    currentNode = treeContext.tree.getLowestNode(currentPoint);

    isLegal();
}

/**
 * Captures the current location that was moved to and the node linked with that location.
 * Redraws the tree so that any highlights are removed and determines legality.
 * @param event The mouse move event while using the erasure tool
 */
export function erasureMouseMove(event: MouseEvent) {
    const currentPoint: Point = new Point(event.x - offset.x, event.y - offset.y);
    currentNode = treeContext.tree.getLowestNode(currentPoint);

    redrawTree(treeContext.tree);
    isLegal();
}

/**
 * If the node is legal finds the current location and the lowest parent. If that is not null
 * removes the current node from the tree and redraws the tree to represent that.
 * @param event The mouse move event while using the erasure tool
 */
export function erasureMouseUp(event: MouseEvent) {
    if (legalNode) {
        const currentPoint: Point = new Point(event.x - offset.x, event.y - offset.y);
        const currentParent = treeContext.tree.getLowestParent(currentPoint);
        if (currentParent !== null) {
            currentParent.remove(currentPoint);
        }
        redrawTree(treeContext.tree);
    }

    currentNode = null;
    legalNode = false;
}

/**
 * If the mouse is exited the canvas resets the current node and makes it illegal.
 */
export function erasureMouseOut() {
    currentNode = null;
    legalNode = false;
    redrawTree(treeContext.tree);
}

/**
 * Determines the legality of the current node.
 */
function isLegal() {
    //If the node is not the tree, is not null, and is even it is legal
    if (
        currentNode !== treeContext.tree.sheet &&
        currentNode !== null &&
        treeContext.tree.getLevel(currentNode) % 2 === 0
    ) {
        legalNode = true;
        highlightChildren(currentNode, illegalColor());
    } else {
        legalNode = false;
    }
}