/**
 * @file Contains methods for the erasure inference rule.
 * A node is legal for erasure if the node is not the tree, is not null, and on an even cut level.
 *
 * @author Dawn Moore
 * @author Anusha Tiwari
 */

import {AEGTree} from "../AEG/AEGTree";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {getCurrentProofTree} from "./ProofToolUtils";
import {highlightNode, redrawProof, redrawTree} from "../SharedToolUtils/DrawUtils";
import {illegalColor} from "../Themes";
import {offset} from "../SharedToolUtils/DragTool";
import {Point} from "../AEG/Point";
import {ProofModeMove, ProofModeNode} from "../ProofHistory/ProofModeNode";
import {reInsertNode} from "../SharedToolUtils/EditModeUtils";
import {TreeContext} from "../TreeContext";

//Point the user has recently clicked.
let currentPoint: Point;

//Node in question.
let currentNode: CutNode | AtomNode | null = null;

//True if currentNode is not The Sheet of Assertion (i.e can be erased.)
let legalNode: boolean;

//AEGTree we want to erase currentNode from.
let currentProofTree: AEGTree;

//Copy of currentProofTree.
let tempTree: AEGTree;

/**
 * Sets currentPoint according to the coordinates given by the incoming MouseEvent.
 * Then sets currentNode to the lowest node containing currentPoint.
 * Then determines legality and highlights accordingly.
 *
 * @param event Incoming MouseEvent.
 */
export function erasureMouseDown(event: MouseEvent): void {
    currentPoint = new Point(event.x - offset.x, event.y - offset.y);
    currentProofTree = getCurrentProofTree();
    tempTree = new AEGTree(currentProofTree.sheet);
    currentNode = currentProofTree.getLowestNode(currentPoint);

    determineLegalityAndHighlightAsIllegal();
}

/**
 * Follows the same control flow as erasureMouseDown.
 *
 * @see erasureMouseDown
 * @param event Incoming MouseEvent.
 */
export function erasureMouseMove(event: MouseEvent): void {
    currentPoint = new Point(event.x - offset.x, event.y - offset.y);

    if (currentNode !== null) {
        currentNode = currentProofTree.getLowestNode(currentPoint);
        redrawProof();
        determineLegalityAndHighlightAsIllegal();
    }
}

/**
 * Queues an Erasure step to the proof history.
 * If legal,
 *      Removes the lowest node containing the coordinates given by the incoming MouseEvent, and
 *      Adds the queued Erasure step.
 *
 * @param event Incoming MouseEvent.
 */
export function erasureMouseUp(event: MouseEvent): void {
    if (legalNode) {
        const nextProof = new ProofModeNode(currentProofTree, ProofModeMove.ERASURE);

        currentPoint = new Point(event.x - offset.x, event.y - offset.y);
        const currentParent = nextProof.tree.getLowestParent(currentPoint);
        if (currentParent !== null) {
            currentParent.remove(currentPoint);
        }

        TreeContext.pushToProof(nextProof);
        redrawProof();
    }

    currentNode = null;
    legalNode = false;
}

/**
 * Reinserts currentNode into tempTree if necessary and sets fields to defaults.
 */
export function erasureMouseOut(): void {
    if (legalNode && currentNode !== null) {
        reInsertNode(tempTree, currentNode);
    }
    currentNode = null;
    legalNode = false;
    redrawProof();
}

/**
 * If currentNode is legal as defined above,
 *      Highlights currentNode as the illegal color, and
 *      Inserts currentNode into tempTree.
 *
 * Otherwise sets legality to false.
 */
function determineLegalityAndHighlightAsIllegal(): void {
    if (
        currentNode !== currentProofTree.sheet &&
        currentNode !== null &&
        currentProofTree.getLevel(currentNode) % 2 === 0
    ) {
        legalNode = true;
        const tempParent = tempTree.getLowestParent(currentPoint);
        if (tempParent !== null) {
            tempParent.remove(currentPoint);
        }

        redrawTree(tempTree);
        highlightNode(currentNode, illegalColor());
        tempTree.insert(currentNode);
    } else {
        legalNode = false;
    }
}
