/**
 * Inference rule for erasure
 * @author Dawn Moore
 */

import {Point} from "../AEG/Point";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {redrawProof} from "../SharedToolUtils/DrawUtils";
import {treeContext} from "../treeContext";
import {illegalColor} from "../Themes";
import {offset} from "../SharedToolUtils/DragTool";
import {highlightChildren} from "../SharedToolUtils/EditModeUtils";
import {ProofNode} from "../AEG/ProofNode";
import {AEGTree} from "../AEG/AEGTree";
import {getCurrentProofTree} from "./ProofToolsUtils";

//The node selected with the user mouse down.
let currentNode: CutNode | AtomNode | null = null;

//Whether or not the node is allowed to be moved (not the sheet).
let legalNode: boolean;

let currentProofTree: AEGTree;

/**
 * Captures the current location, and the node linked with that location.
 * Determines if it is a legal node.
 * @param event The mouse down event while using the erasure tool
 */
export function erasureMouseDown(event: MouseEvent) {
    const currentPoint: Point = new Point(event.x - offset.x, event.y - offset.y);
    currentProofTree = getCurrentProofTree();
    currentNode = currentProofTree.getLowestNode(currentPoint);

    isLegal();
}

/**
 * Captures the current location that was moved to and the node linked with that location.
 * Redraws the tree so that any highlights are removed and determines legality.
 * @param event The mouse move event while using the erasure tool
 */
export function erasureMouseMove(event: MouseEvent) {
    const currentPoint: Point = new Point(event.x - offset.x, event.y - offset.y);
    currentNode = currentProofTree.getLowestNode(currentPoint);

    redrawProof();
    isLegal();
}

/**
 * If the node is legal finds the current location and the lowest parent. If that is not null
 * removes the current node from the tree and redraws the tree to represent that.
 * @param event The mouse move event while using the erasure tool
 */
export function erasureMouseUp(event: MouseEvent) {
    if (legalNode) {
        //Stores the tree of the previous proof so that we can perform double cut actions without
        //altering that tree
        const nextProof = new ProofNode(currentProofTree, "Erasure");

        const currentPoint: Point = new Point(event.x - offset.x, event.y - offset.y);
        const currentParent = nextProof.tree.getLowestParent(currentPoint);
        if (currentParent !== null) {
            currentParent.remove(currentPoint);
        }

        treeContext.pushToProof(nextProof);
        redrawProof();
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
    redrawProof();
}

/**
 * Determines the legality of the current node.
 */
function isLegal() {
    //If the node is not the tree, is not null, and is even it is legal
    if (
        currentNode !== currentProofTree.sheet &&
        currentNode !== null &&
        currentProofTree.getLevel(currentNode) % 2 === 0
    ) {
        legalNode = true;
        highlightChildren(currentNode, illegalColor());
    } else {
        legalNode = false;
    }
}
