/**
 * @file Contains methods for iterating nodes and subgraphs on the Proof Mode canvas.
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

//True if currentNode is not The Sheet of Assertion (i.e can be moved.)
let legalNode: boolean;

//AEGTree at the current Proof step.
let currentProofTree: AEGTree;

//Copy of currentProofTree.
let tempTree: AEGTree;

/**
 * Sets currentPoint according to the coordinates given by the incoming MouseEvent.
 * Then sets currentNode, determines legality and highlights accordingly.
 *
 * @param event Incoming MouseEvent.
 */
export function deiterationMouseDown(event: MouseEvent): void {
    currentPoint = new Point(event.x - offset.x, event.y - offset.y);
    currentProofTree = getCurrentProofTree();
    tempTree = new AEGTree(currentProofTree.sheet);
    currentNode = currentProofTree.getLowestNode(currentPoint);
    determineLegalityAndHighlightAsIllegal();
}

/**
 * Sets currentPoint according to the coordinates given by the incoming MouseEvent.
 *
 * Then follows the same control flow as deiterationMouseDown.
 *
 * @see deiterationMouseDown
 * @param event Incoming MouseEvent.
 */
export function deiterationMouseMove(event: MouseEvent): void {
    currentPoint = new Point(event.x - offset.x, event.y - offset.y);
    if (currentNode !== null) {
        currentNode = currentProofTree.getLowestNode(currentPoint);
        redrawProof();
        determineLegalityAndHighlightAsIllegal();
    }
}

/**
 * If legality is true,
 *      Sets currentPoint to the coordinates given by the incoming MouseEvent, and
 *      deiterates the node at currentPoint if able.
 *
 * @param event Incoming MouseEvent.
 */
export function deiterationMouseUp(event: MouseEvent): void {
    if (legalNode) {
        currentPoint = new Point(event.x - offset.x, event.y - offset.y);
        if (
            currentNode !== null &&
            canDeiterate(currentProofTree.sheet, currentProofTree.getLevel(currentNode))
        ) {
            const currentParent: CutNode | null = currentProofTree.getLowestParent(currentPoint);
            if (currentParent instanceof CutNode) {
                currentParent.remove(currentPoint);
            }
            TreeContext.pushToProof(new ProofModeNode(currentProofTree, ProofModeMove.DEITERATION));
        }
    }
    legalNode = false;
    redrawProof();
}

/**
 * Reinserts currentNode into tempTree if able and sets fields to defaults.
 */
export function deiterationMouseOut(): void {
    if (legalNode && currentNode !== null) {
        reInsertNode(tempTree, currentNode);
    }
    legalNode = false;
    currentNode = null;
    redrawProof();
}

/**
 * If currentNode is not null and can be deiterated,
 *      Highlights currentNode and any effected children as the illegal color, and
 *      Inserts currentNode into tempTree.
 *
 * Otherwise sets legality to false.
 */
function determineLegalityAndHighlightAsIllegal(): void {
    if (
        currentNode !== null &&
        !(currentNode instanceof CutNode && currentNode.ellipse === null) &&
        canDeiterate(currentProofTree.sheet, currentProofTree.getLevel(currentNode))
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

/**
 * Checks and returns if the incoming CutNode can be deiterated at the incoming level number.
 *
 * If a CutNode or AtomNode equal to currentParent is found at a deeper cut level, then it is able
 * to be deiterated.
 *
 * @param currentParent Incoming CutNode.
 * @param level Incoming level number.
 * @returns True if currentParent can be deiterated.
 */
function canDeiterate(currentParent: CutNode, level: number): boolean {
    let potentialParent: CutNode | null = null;
    for (let i = 0; i < currentParent.children.length; i++) {
        if (
            currentParent.children[i] instanceof CutNode &&
            currentNode instanceof CutNode &&
            currentNode.isEqualTo(currentParent.children[i] as CutNode) &&
            currentNode.ellipse !== (currentParent.children[i] as CutNode).ellipse
        ) {
            return true;
        } else if (
            currentParent.children[i] instanceof AtomNode &&
            currentNode instanceof AtomNode &&
            (currentParent.children[i] as AtomNode).identifier === currentNode.identifier &&
            currentParent.children[i].toString() !== currentNode.toString()
        ) {
            return true;
        } else if (
            currentParent.children[i] instanceof CutNode &&
            (currentParent.children[i] as CutNode).containsNode(currentNode!) &&
            currentProofTree.getLevel(currentParent.children[i]) < level
        ) {
            potentialParent = currentParent.children[i] as CutNode;
        }
    }

    if (potentialParent !== null) {
        return canDeiterate(potentialParent, level);
    }

    return false;
}
