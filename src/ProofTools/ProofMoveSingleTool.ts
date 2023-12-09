/**
 * A tool for proof mode to allow for atom and cut movement so long as the meaning remains the same.
 * @author Dawn Moore
 */

import {AEGTree} from "../AEG/AEGTree";
import {Point} from "../AEG/Point";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {treeContext} from "../treeContext";
import {offset} from "../SharedToolUtils/DragTool";
import {drawCut, drawAtom, redrawTree, redrawProof} from "../SharedToolUtils/DrawUtils";
import {legalColor, illegalColor} from "../Themes";
import {alterAtom, alterCut} from "../SharedToolUtils/EditModeUtils";
import {ProofNode} from "../AEG/ProofNode";
import {isMoveLegal} from "./ProofToolsUtils";
import {getCurrentProofTree} from "./ProofToolsUtils";

//The initial point the user pressed down.
let startingPoint: Point;

//The node selected with the user mouse down.
let currentNode: CutNode | AtomNode | null = null;

//Whether or not the node is allowed to be moved (not the sheet).
let legalNode: boolean;

//The tree of the current proof step
let currentProofTree: AEGTree;

/**
 * Retrieves the current location on the window and the lowest node on the tree containing that point
 * If this node is not the sheet then it can be moved, we find it's parent and remove it from that.
 * If the this node has any children reinsert them into the tree so they're not lost.
 * @param event The mouse down event while using proof move single tool
 */
export function proofMoveSingleMouseDown(event: MouseEvent) {
    currentProofTree = getCurrentProofTree();
    startingPoint = new Point(event.x - offset.x, event.y - offset.y);
    currentNode = currentProofTree.getLowestNode(startingPoint);

    //If what we have selected is the sheet then it is an invalid selection.
    if (currentNode !== currentProofTree.sheet && currentNode !== null) {
        const currentParent = currentProofTree.getLowestParent(startingPoint);
        if (currentParent !== null) {
            currentParent.remove(startingPoint);
        }

        if (currentNode instanceof CutNode && currentNode.children.length !== 0) {
            //The cut node loses custody of its children so that those can still be redrawn.
            for (let i = 0; i < currentNode.children.length; i++) {
                currentProofTree.insert(currentNode.children[i]);
            }
            currentNode.children = [];
        }
        legalNode = true;

        // highlight the chosen node in legal color to show what will be moved
        redrawTree(currentProofTree);
        if (currentNode instanceof AtomNode) {
            drawAtom(currentNode, legalColor(), true);
        } else {
            drawCut(currentNode as CutNode, legalColor());
        }
    } else {
        legalNode = false;
    }
}

/**
 * Calculates the difference in x and y between the starting and current mouse locations.
 * Creates a temporary node with the respective change in position and draws that to show movement.
 * @param event The mouse event while using proof move single tool
 */
export function proofMoveSingleMouseMove(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );

        redrawTree(currentProofTree);
        //If the node is a cut, and it has an ellipse, make a temporary cut and draw that.
        if (currentNode instanceof CutNode) {
            const tempCut: CutNode = alterCut(currentNode, moveDifference);
            const color = isMoveLegal(currentProofTree, tempCut) ? legalColor() : illegalColor();
            drawCut(tempCut, color);
        } //If the node is an atom, make a temporary atom and check legality, drawing that.
        else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = alterAtom(currentNode, moveDifference);
            const color = isMoveLegal(currentProofTree, tempAtom) ? legalColor() : illegalColor();
            drawAtom(tempAtom, color, true);
        }
    }
}

/**
 * Calculates the difference in x and y between the starting and current mouse locations.
 * If the node's new position is considered legal then insert it, otherwise insert the original node
 * before it was moved.
 * Add this current tree to the proof history for it to be used later.
 * @param event The mouse up event while using proof move single tool
 */
export function proofMoveSingleMouseUp(event: MouseEvent) {
    if (legalNode) {
        const nextStep = new ProofNode(currentProofTree, "Single Move");
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );
        let tempNode: CutNode | AtomNode | null = null;

        if (currentNode instanceof CutNode) {
            tempNode = alterCut(currentNode, moveDifference);
        } else if (currentNode instanceof AtomNode) {
            tempNode = alterAtom(currentNode, moveDifference);
        }

        if (tempNode !== null && isMoveLegal(currentProofTree, tempNode)) {
            nextStep.tree.insert(tempNode);
            treeContext.pushToProof(nextStep);
        }
    }
    redrawProof();
    legalNode = false;
}

/**
 * If the mouse leaves the canvas then reinsert our current node if it is legal and reset the canvas.
 */
export function proofMoveSingleMouseOut() {
    if (legalNode && currentNode !== null) {
        currentProofTree.insert(currentNode);
    }
    legalNode = false;
    redrawProof();
}
