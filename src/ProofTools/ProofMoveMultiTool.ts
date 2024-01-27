/**
 * @file Contains methods for moving several nodes at a time, on only the same cut level,
 * in only one cut in Proof Mode. When it is said that a node is "removed" in the documentation,
 * this means that it is removed from the Draw Mode AEGTree but visually is still present.
 *
 * @author Dawn Moore
 */

import {AEGTree} from "../AEG/AEGTree";
import {alterAtom, alterCutChildren, drawAltered} from "../SharedToolUtils/EditModeUtils";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {
    changeCursorStyle,
    determineAndChangeCursorStyle,
    drawAtom,
    highlightNode,
    redrawProof,
    redrawTree,
} from "../SharedToolUtils/DrawUtils";
import {getCurrentProofTree, isMoveLegal} from "./ProofToolUtils";
import {illegalColor, legalColor} from "../Themes";
import {offset} from "../SharedToolUtils/DragTool";
import {Point} from "../AEG/Point";
import {ProofModeMove} from "../Proof/ProofModeMove";
import {ProofNode} from "../Proof/ProofNode";
import {TreeContext} from "../TreeContext";

//First Point the user clicks.
let startingPoint: Point;

//Node in question.
let currentNode: CutNode | AtomNode | null = null;

//Lowest parent of currentNode.
let currentParent: CutNode | null = null;

//True if currentNode is not The Sheet of Assertion or null (i.e can be moved.)
let legalNode: boolean;

//AEGTree at the current proof step.
let currentProofTree: AEGTree;

/**
 * Sets startingPoint according to the coordinates given by the incoming MouseEvent.
 * Then sets currentNode to the lowest node containing startingPoint.
 *
 * Then, if legal, removes currentNode and highlights it according to its and its children's
 * positions' validity.
 *
 * @param event Incoming MouseEvent.
 */
export function proofMoveMultiMouseDown(event: MouseEvent): void {
    currentProofTree = getCurrentProofTree();
    startingPoint = new Point(event.x - offset.x, event.y - offset.y);
    currentNode = currentProofTree.getLowestNode(startingPoint);

    if (currentNode !== currentProofTree.sheet && currentNode !== null) {
        changeCursorStyle("cursor: grabbing");
        currentParent = currentProofTree.getLowestParent(startingPoint);
        if (currentParent !== null) {
            currentParent.remove(startingPoint);
        }
        legalNode = true;
        redrawTree(currentProofTree);
        highlightNode(currentNode, legalColor());
    } else {
        legalNode = false;
    }
}

/**
 * Alters currentNode and its children according to the coordinates given
 * by the incoming MouseEvent.
 *
 * Then, if legal, removes the altered currentNode and
 * highlights it according to its and its children's positions' validity.
 *
 * @param event Incoming MouseEvent.
 */
export function proofMoveMultiMouseMove(event: MouseEvent): void {
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
            determineAndChangeCursorStyle(color, "cursor: grabbing", "cursor: no-drop");
        } else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = alterAtom(currentNode, moveDifference);
            const color = isMoveLegal(currentProofTree, tempAtom) ? legalColor() : illegalColor();
            drawAtom(tempAtom, color, true);
            determineAndChangeCursorStyle(color, "cursor: grabbing", "cursor: no-drop");
        }
    }
}

/**
 * Queues a Multi Move step to be added to the proof history.
 * Then alters currentNode and its children according to the coordinates given
 * by the incoming MouseEvent.
 *
 * Then, if legal, inserts the altered currentNode and its children.
 *
 * @param event Incoming MouseEvent.
 */
export function proofMoveMultiMouseUp(event: MouseEvent): void {
    if (legalNode) {
        changeCursorStyle("cursor: default");
        const nextStep = new ProofNode(currentProofTree, ProofModeMove.MOVE_MULTI);
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
            TreeContext.pushToProof(nextStep);
        }
    }
    redrawProof();
    legalNode = false;
}

/**
 * Reinserts currentNode into tempTree if necessary and sets fields to defaults.
 */
export function proofMoveMultiMouseOut(): void {
    changeCursorStyle("cursor: default");
    if (legalNode && currentNode !== null) {
        currentProofTree.insert(currentNode);
    }
    legalNode = false;
    redrawProof();
}
