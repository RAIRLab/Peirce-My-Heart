/**
 * @file Contains methods for deleting two CutNodes at once on the Proof Mode HTML canvas.
 *
 * @author Dawn Moore
 * @author Anusha Tiwari
 */

import {AEGTree} from "../AEG/AEGTree";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {drawCut, redrawProof, redrawTree} from "../SharedToolUtils/DrawUtils";
import {getCurrentProofTree} from "./ProofToolUtils";
import {illegalColor} from "../Themes";
import {offset} from "../SharedToolUtils/DragTool";
import {Point} from "../AEG/Point";
import {ProofNode} from "../Proof/ProofNode";
import {readdChildren, reInsertNode} from "../SharedToolUtils/EditModeUtils";
import {TreeContext} from "../TreeContext";

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
 * Then sets currentNode to the lowest node containing currentPoint.
 * Then determines legality and highlights the effected nodes as the illegal color.
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
 * Then sets currentNode according to currentPoint, determines legality and highlights
 * currentNode as the illegal color.
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
 * Then, if both CutNodes can legally be removed, removes both and pushes the queued proof step.
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
 * Reinserts currentNode into tempTree if necessary and sets fields to defaults.
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
 * A double cut is considered valid an outer CutNode has one CutNode as its only child and
 * the outer CutNode is not The Sheet of Assertion.
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
 * Determines if the selected node is part of a legal double cut and highlights accordingly.
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
