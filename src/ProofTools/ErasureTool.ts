/**
 * Inference rule for erasure
 * @author Dawn Moore
 */

import {Point} from "../AEG/Point";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {treeContext} from "../treeContext";
import {illegalColor} from "../Themes";
import {ProofNode} from "../AEG/ProofNode";
import {AEGTree} from "../AEG/AEGTree";
import {reInsertNode} from "../SharedToolUtils/EditModeUtils";
import {redrawProof, redrawTree, highlightNode} from "../SharedToolUtils/DrawUtils";
import {offset} from "../SharedToolUtils/DragTool";

//The node selected with the user mouse down.
let currentNode: CutNode | AtomNode | null = null;

//Whether or not the node is allowed to be moved (not the sheet).
let legalNode: boolean;

//The current tree in the proof chain
let currentProofTree: AEGTree;

//A copy of the tree we are dealing with in this step
let tempTree: AEGTree;

//The point that the current mouse event is targeting
let currentPoint: Point;

/**
 * Captures the current location, and the node linked with that location.
 * Determines if it is a legal node.
 * @param event The mouse down event while using the erasure tool
 */
export function erasureMouseDown(event: MouseEvent) {
    currentPoint = new Point(event.x - offset.x, event.y - offset.y);
    currentProofTree = new AEGTree();
    if (treeContext.currentProofStep) {
        currentProofTree.sheet = treeContext.currentProofStep.tree.sheet.copy();
    }
    tempTree = new AEGTree(currentProofTree.sheet);
    currentNode = currentProofTree.getLowestNode(currentPoint);

    isLegal();
}

/**
 * Captures the current location that was moved to and the node linked with that location.
 * Redraws the tree so that any highlights are removed and determines legality.
 * @param event The mouse move event while using the erasure tool
 */
export function erasureMouseMove(event: MouseEvent) {
    currentPoint = new Point(event.x - offset.x, event.y - offset.y);

    if (currentNode !== null) {
        currentNode = currentProofTree.getLowestNode(currentPoint);
        redrawProof();
        isLegal();
    }
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

        currentPoint = new Point(event.x - offset.x, event.y - offset.y);
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
    if (legalNode && currentNode !== null) {
        reInsertNode(tempTree, currentNode);
    }
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

        //Find the parent at the point we are on
        const tempParent = tempTree.getLowestParent(currentPoint);
        if (tempParent !== null) {
            //remove the node from the parent
            tempParent.remove(currentPoint);
        }

        //Draw the temp tree, from which the node we want to erase has been removed
        redrawTree(tempTree);
        //Highlight the node selected for erasure in illegal color
        highlightNode(currentNode, illegalColor());
        //Insert it back into the temporary tree
        tempTree.insert(currentNode);
    } else {
        legalNode = false;
    }
}
