/**
 * A tool to allow for the movement for an atom or a cut and all of it's children so long as the
 * meaning of the proof remains the same.
 * @author Dawn Moore
 */

import {AEGTree} from "../AEG/AEGTree";
import {ProofNode} from "../AEG/ProofNode";
import {Point} from "../AEG/Point";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {treeContext} from "../treeContext";
import {offset} from "../DrawModes/DragTool";
import {drawAtom, redrawProof, redrawTree} from "../DrawModes/DrawUtils";
import {legalColor, illegalColor} from "../Themes";
import {drawAltered, alterAtom, alterCutChildren} from "../DrawModes/EditModeUtils";
import {isMoveLegal} from "./ProofMoveUtils";

//The initial point the user pressed down.
let startingPoint: Point;

//The current node and its children we will be moving.
let currentNode: CutNode | AtomNode | null = null;

//The parent of the node we removed.
let currentParent: CutNode | null = null;

//Whether or not the node is allowed to be moved (not the sheet).
let legalNode: boolean;

//The tree of the current proof step
let currentProofTree: AEGTree;

/**
 * Retrieves the current location on the window and the lowest node on the tree containing that point
 * If this node is not the sheet then it can be moved, we find it's parent and remove it from that.
 * @param event The mouse down event while using move multiple tool in proof mode
 */
export function proofMoveMultiMouseDown(event: MouseEvent) {
    currentProofTree = new AEGTree();
    if (treeContext.currentProofStep) {
        currentProofTree.sheet = treeContext.currentProofStep.tree.sheet.copy();
    }
    startingPoint = new Point(event.x - offset.x, event.y - offset.y);
    currentNode = currentProofTree.getLowestNode(startingPoint);

    if (currentNode !== currentProofTree.sheet && currentNode !== null) {
        currentParent = currentProofTree.getLowestParent(startingPoint);
        if (currentParent !== null) {
            currentParent.remove(startingPoint);
        }
        legalNode = true;
    } else {
        legalNode = false;
    }
}

/**
 * Calculates the difference in x and y between the starting and current mouse locations.
 * Creates a temporary node with the respective changes to all potential children in their
 * respective positions and draws that to show movement.
 * @param event The mouse move event while using move multiple tool in proof mode
 */
export function proofMoveMultiMouseMove(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );

        redrawTree(currentProofTree);
        if (currentNode instanceof CutNode) {
            const tempCut: CutNode = alterCutChildren(currentNode, moveDifference);
            const color = isMoveLegal(currentProofTree, tempCut) ? legalColor() : illegalColor();
            drawAltered(currentNode, color, moveDifference);
        } else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = alterAtom(currentNode, moveDifference);
            const color = isMoveLegal(currentProofTree, tempAtom) ? legalColor() : illegalColor();
            drawAtom(tempAtom, color, true);
        }
    }
}

/**
 * Calculates the difference in x and y between the starting and current mouse locations.
 * If the node's new position (and any of it's children if it has any) is considered legal then
 * insert it, otherwise insert the original node before it was moved.
 * Add this current tree to the proof history for it to be used later.
 * @param event The mouse up event while using move multiple tool in proof mode
 */
export function proofMoveMultiMouseUp(event: MouseEvent) {
    if (legalNode) {
        const nextStep = new ProofNode(currentProofTree, "Multi Movement");
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );
        let tempNode: CutNode | AtomNode | null = null;

        if (currentNode instanceof CutNode) {
            tempNode = alterCutChildren(currentNode, moveDifference);
        } else if (currentNode instanceof AtomNode) {
            tempNode = alterAtom(currentNode, moveDifference);
        }

        if (tempNode !== null && isMoveLegal(currentProofTree, tempNode)) {
            nextStep.tree.insert(tempNode);
            treeContext.currentProofStep = nextStep;
            treeContext.proof.push(treeContext.currentProofStep);
            redrawTree(treeContext.currentProofStep.tree);
        }
    }
    redrawProof();
    legalNode = false;
}

/**
 * If the mouse leaves the canvas then reinsert our current node if it is legal and reset the canvas.
 */
export function proofMoveMultiMouseOut() {
    if (legalNode && currentNode !== null) {
        currentProofTree.insert(currentNode);
    }
    legalNode = false;
    redrawTree(treeContext.getLastProofStep().tree);
}
