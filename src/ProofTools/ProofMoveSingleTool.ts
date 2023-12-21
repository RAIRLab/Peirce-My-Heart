import {AEGTree} from "../AEG/AEGTree";
import {alterAtom, alterCut} from "../SharedToolUtils/EditModeUtils";
import {AtomNode} from "../AEG/AtomNode";
import {
    changeCursorStyle,
    determineAndChangeCursorStyle,
    drawAtom,
    drawCut,
    redrawProof,
    redrawTree,
} from "../SharedToolUtils/DrawUtils";
import {CutNode} from "../AEG/CutNode";
import {getCurrentProofTree, isMoveLegal} from "./ProofToolUtils";
import {illegalColor, legalColor} from "../Themes";
import {offset} from "../SharedToolUtils/DragTool";
import {Point} from "../AEG/Point";
import {ProofNode} from "../AEG/ProofNode";
import {TreeContext} from "../TreeContext";

/**
 * Contains methods for moving one node at a time, on only the same cut level, in only one cut in Proof Mode.
 *
 * When it is said that a node is "removed" in the documentation,
 * This means that it is removed from the Draw Mode AEGTree but visually is still present.
 *
 * When a CutNode's position is described as being valid or not,
 * This means that we are determining if it can currently be inserted into the AEGTree without
 * intersection.
 *
 * @author Dawn Moore
 */

//First Point the user clicks.
let startingPoint: Point;

//Node in question.
let currentNode: CutNode | AtomNode | null = null;

//True if currentNode is not The Sheet of Assertion or null (i.e can be moved.)
let legalNode: boolean;

//AEGTree at the current proof step.
let currentProofTree: AEGTree;

/**
 * Sets startingPoint according to the coordinates given by the incoming MouseEvent.
 * Then sets currentNode to the lowest node containing startingPoint.
 * Then, if legal, removes currentNode and highlights it according to its
 * position's validity.
 *
 * @param event Incoming MouseEvent.
 */
export function proofMoveSingleMouseDown(event: MouseEvent): void {
    currentProofTree = getCurrentProofTree();
    startingPoint = new Point(event.x - offset.x, event.y - offset.y);
    currentNode = currentProofTree.getLowestNode(startingPoint);
    if (currentNode !== currentProofTree.sheet && currentNode !== null) {
        changeCursorStyle("cursor: grabbing");
        const currentParent = currentProofTree.getLowestParent(startingPoint);
        if (currentParent !== null) {
            currentParent.remove(startingPoint);
        }

        if (currentNode instanceof CutNode && currentNode.children.length !== 0) {
            for (let i = 0; i < currentNode.children.length; i++) {
                currentProofTree.insert(currentNode.children[i]);
            }
            currentNode.children = [];
        }
        legalNode = true;

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
 * Alters currentNode according to the coordinates given by the incoming MouseEvent.
 * Then highlights currentNode as either the legal or illegal color depending on move legality.
 *
 * @param event Incoming MouseEvent.
 */
export function proofMoveSingleMouseMove(event: MouseEvent): void {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );

        redrawTree(currentProofTree);
        if (currentNode instanceof CutNode) {
            const tempCut: CutNode = alterCut(currentNode, moveDifference);
            const color = isMoveLegal(currentProofTree, tempCut) ? legalColor() : illegalColor();
            drawCut(tempCut, color);
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
 * Queues a Single Move step to be added to the proof history.
 * Then alters currentNode according to the coordinates given by the incoming MouseEvent.
 * If this Single Move is valid, then the moved node and queued Single Move step are added to
 * the proof.
 *
 * @param event Incoming MouseEvent.
 */
export function proofMoveSingleMouseUp(event: MouseEvent): void {
    if (legalNode) {
        changeCursorStyle("cursor: default");
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
            TreeContext.pushToProof(nextStep);
        }
    }
    redrawProof();
    legalNode = false;
}

/**
 * Reinserts currentNode into tempTree if necessary and sets fields to defaults.
 */
export function proofMoveSingleMouseOut(): void {
    changeCursorStyle("cursor: default");
    if (legalNode && currentNode !== null) {
        currentProofTree.insert(currentNode);
    }
    legalNode = false;
    redrawProof();
}
