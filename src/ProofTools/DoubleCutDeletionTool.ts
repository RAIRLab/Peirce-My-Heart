import {AEGTree} from "../AEG/AEGTree";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {drawCut, redrawProof, redrawTree} from "../SharedToolUtils/DrawUtils";
import {getCurrentProofTree} from "./ProofToolUtils";
import {illegalColor} from "../Themes";
import {offset} from "../SharedToolUtils/DragTool";
import {Point} from "../AEG/Point";
import {ProofNode} from "../AEG/ProofNode";
import {readdChildren, reInsertNode} from "../SharedToolUtils/EditModeUtils";
import {TreeContext} from "../TreeContext";

/**
 * Contains methods for deleting two CutNodes at once on the Proof Mode HTML canvas.
 *
 * @author Dawn Moore
 * @author Anusha Tiwari
 */

//Point the user has recently clicked.
let currentPoint: Point;

//Node in question.
let currentNode: CutNode | AtomNode | null = null;

//True if currentNode is not The Sheet of Assertion or null (i.e can be moved.)
let legalNode: boolean;

//AEGTree at the current proof step.
let currentProofTree: AEGTree;

//Copy of currentProofTree.
let tempTree: AEGTree;

/**
 * Sets currentPoint according to the coordinates given by the incoming MouseEvent.
 * Then sets currentProofTree to the current proof tree.
 * Then sets tempTree to a copy of currentProofTree's Sheet of Assertion.
 * Then sets currentNode to the lowest node containing currentPoint.
 * Then determines legality and highlights the affected nodes as the illegal color.
 *
 * @param event Incoming MouseEvent.
 */
export function doubleCutDeletionMouseDown(event: MouseEvent): void {
    currentPoint = new Point(event.x - offset.x, event.y - offset.y);
    currentProofTree = getCurrentProofTree();
    tempTree = new AEGTree(currentProofTree.sheet);
    currentNode = currentProofTree.getLowestNode(currentPoint);

    determineLegalityAndHighlightAsIllegal();
}

/**
 * Sets currentPoint according to the coordinates given by the incoming MouseEvent.
 * Then sets tempTree to a copy of currentProofTree's Sheet of Assertion.
 * Then if currentNode is not null,
 *      Sets currentNode to the lowest node containing currentPoint,
 *      Redraws the proof, and
 *      Determines validity.
 *
 * @param event Incoming MouseEvent.
 */
export function doubleCutDeletionMouseMove(event: MouseEvent): void {
    currentPoint = new Point(event.x - offset.x, event.y - offset.y);
    tempTree = new AEGTree(currentProofTree.sheet);
    if (currentNode !== null) {
        currentNode = currentProofTree.getLowestNode(currentPoint);
        redrawProof();
        determineLegalityAndHighlightAsIllegal();
    }
}

/**
 * Queues a Double Cut Delete step to be added to the proof history.
 * Then sets currentPoint according to the coordinates given by the incoming MouseEvent.
 * Then if legality is true and currentNode is a CutNode,
 *      Retrieves the lowest parent containing currentPoint, and
 *      Retrieves that parent's only child.
 *      Then if the current parent is not null and its only child is a CutNode,
 *          Removes the lowest child node of the current parent containing currentPoint,
 *          Inserts any of the parent's child's children back into the proof AEGTree, and
 *          Adds the queued step to the proof history.
 *
 * Then redraws the proof.
 *
 * @param event Incoming MouseEvent.
 */
export function doubleCutDeletionMouseUp(event: MouseEvent): void {
    const nextProof = new ProofNode(currentProofTree, "DC Delete");
    currentPoint = new Point(event.x - offset.x, event.y - offset.y);

    if (legalNode && currentNode instanceof CutNode) {
        const currentParent: CutNode | null = nextProof.tree.getLowestParent(currentPoint);
        const lowerCut: CutNode | AtomNode | null = currentNode.children[0];

        if (currentParent !== null && lowerCut instanceof CutNode) {
            currentParent.remove(currentPoint);
            for (let i = 0; i < lowerCut.children.length; i++) {
                nextProof.tree.insert(lowerCut.children[i]);
            }
            TreeContext.pushToProof(nextProof);
        }
    }

    redrawProof();
}

/**
 * If legality is true and currentNode is not null,
 *      Reinserts currentNode into tempTree.
 *
 * Then sets currentNode to null.
 * Then sets legality to false.
 * Then redraws the proof.
 */
export function doubleCutDeletionMouseOut(): void {
    if (legalNode && currentNode !== null) {
        reInsertNode(tempTree, currentNode);
    }
    currentNode = null;
    legalNode = false;
    redrawProof();
}

/**
 * Checks and returns if the incoming CutNode is the outer CutNode in a valid double cut.
 *
 * A double cut is considered valid an outer CutNode has one CutNode as its only child and the outer CutNode is not The Sheet of Assertion.
 *
 * @param currentCut Incoming CutNode.
 * @returns True if the incoming CutNode is the outer CutNode in a valid double cut.
 */
function isOuterCutInDoubleCut(currentCut: CutNode): boolean {
    return (
        currentCut.children.length === 1 &&
        currentCut.children[0] instanceof CutNode &&
        currentNode !== currentProofTree.sheet
    );
}

/**
 * Highlights the incoming CutNode and its only child as the illegal color.
 *
 * @param parentCut Incoming CutNode.
 */
function highlightDoubleCutAsIllegal(parentCut: CutNode): void {
    drawCut(parentCut, illegalColor());
    if (parentCut.children[0] instanceof CutNode) {
        drawCut(parentCut.children[0], illegalColor());
    }
}

/**
 * If currentNode is a CutNode and the outer CutNode in a double cut,
 *      Sets legality to true,
 *      Then if the lowest parent containing currentPoint is not null,
 *          Removes the lowest node containing currentPoint, which is the inner CutNode in a double cut, and
 *          Readds the inner CutNode's children to tempTree.
 *      Then redraws tempTree, and
 *      Highlights the detected double cut as the illegal color.
 *
 * Otherwise sets legality to false.
 */
function determineLegalityAndHighlightAsIllegal(): void {
    if (currentNode instanceof CutNode && isOuterCutInDoubleCut(currentNode)) {
        legalNode = true;
        const tempParent = tempTree.getLowestParent(currentPoint);
        if (tempParent !== null) {
            tempParent.remove(currentPoint);
            //The parent should adopt the children from the lower cut.
            const tempLower = currentNode.children[0].copy() as CutNode;
            readdChildren(tempTree, tempLower);
            tempLower.children = [];
        }

        redrawTree(tempTree);
        highlightDoubleCutAsIllegal(currentNode);
    } else {
        legalNode = false;
    }
}
