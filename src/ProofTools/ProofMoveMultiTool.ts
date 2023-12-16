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
import {ProofNode} from "../AEG/ProofNode";
import {treeContext} from "../treeContext";

/**
 * Contains methods for moving several nodes at a time, on only the same cut level, in only one cut in Proof Mode.
 *
 * When it is said that a node is "removed" in the documentation,
 * This means that it is removed from the Draw Mode AEGTree but visually is still present.
 *
 * @author Dawn Moore
 */

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
 * Sets currentProofTree to the current proof tree.
 * Then sets startingPoint according to the coordinates given by the incoming MouseEvent.
 * Then sets currentNode to the lowest node containing startingPoint.
 *
 * Then if currentNode is not The Sheet of Assertion or null,
 *      sets cursor style to grabbing,
 *      sets currentParent to the lowest CutNode containing startingPoint,
 *      removes currentNode,
 *      sets legality to true,
 *      redraws currentProofTree, and
 *      highlights currentNode as the legal color.
 *
 * @param event The mouse down event while using move multiple tool in proof mode
 */
export function proofMoveMultiMouseDown(event: MouseEvent) {
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
 * Redraws currentProofTree.
 * Then alters currentNode and its children according to the coordinates given by the incoming MouseEvent.
 * Then highlights currentNode and its children as either the legal or illegal color depending on the legality of their positions.
 * Then changes cursor style accordingly.
 *
 * @param event Incoming MouseEvent.
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
 * Sets cursor style to default.
 * Then queues a Multi Move step to be added to the proof history.
 * Then alters currentNode and its children according to the coordinates given by the incoming MouseEvent.
 *
 * Then if the altered node's position and the position of its children are legal,
 *      adds the queued step to the proof history.
 *
 * Then redraws the proof.
 * Then sets legality to false.
 *
 * @param event Incoming MouseEvent.
 */
export function proofMoveMultiMouseUp(event: MouseEvent) {
    if (legalNode) {
        changeCursorStyle("cursor: default");
        const nextStep = new ProofNode(currentProofTree, "Multi Move");
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
            treeContext.pushToProof(nextStep);
        }
    }
    redrawProof();
    legalNode = false;
}

/**
 * Sets cursor style to default.
 * Then inserts currentNode into currentProofTree.
 * Then sets legality to false.
 * Then redraws the proof.
 */
export function proofMoveMultiMouseOut() {
    changeCursorStyle("cursor: default");
    if (legalNode && currentNode !== null) {
        currentProofTree.insert(currentNode);
    }
    legalNode = false;
    redrawProof();
}
