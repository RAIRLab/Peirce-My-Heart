import {AEGTree} from "../AEG/AEGTree";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {getCurrentProofTree} from "./ProofToolUtils";
import {highlightNode, redrawProof, redrawTree} from "../SharedToolUtils/DrawUtils";
import {illegalColor} from "../Themes";
import {offset} from "../SharedToolUtils/DragTool";
import {Point} from "../AEG/Point";
import {ProofNode} from "../AEG/ProofNode";
import {reInsertNode} from "../SharedToolUtils/EditModeUtils";
import {TreeContext} from "../TreeContext";

/**
 * Contains methods for iterating nodes and subgraphs on the Proof Mode canvas.
 *
 * @author Dawn Moore
 * @author Anusha Tiwari
 */

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
 * Then sets currentProofTree to the current proof tree.
 * Then sets tempTree to a copy of currentProofTree.
 * Then sets currentNode to the lowest node containing currentPoint.
 * Then determines legality and highlights any effected nodes as the illegal color.
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
 * Then if currentNode is not null,
 *      Sets currentNode to the lowest node containing currentPoint,
 *      Redraws the proof, and
 *      Determines legality and highlights any effected nodes as the illegal color.
 *
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
 *      If currentNode is not null and can be deiterated,
 *          Removes currentPoint.
 *      Then pushes a "Deiteration" rule to the proof history.
 *
 * Then sets legality to false.
 * Then redraws the proof.
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
            TreeContext.pushToProof(new ProofNode(currentProofTree, "Deiteration"));
        }
    }
    legalNode = false;
    redrawProof();
}

/**
 * If legality is true and currentNode is not null,
 *      Reinserts currentNode into tempTree.
 *
 * Then sets legality to false.
 * Then sets currentNode to null.
 * Then redraws the proof.
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
 *      Sets legality to true, and
 *      If the lowest parent containing currentPoint is not null,
 *          Removes currentNode.
 *      Then redraws temp tree.
 *      Then highlights currentNode and any effected children as the illegal color, and
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
 * As long as the incoming CutNode has children,
 *      If a child of the incoming CutNode's currentNode are both Ellipses and currentNode is equal to that child,
 *          Returns true.
 *      Otherwise if a child of the incoming CutNode is an AtomNode and currentNode is an AtomNode with the same identifier,
 *          Returns true.
 *      Otherwise if a child of the incoming CutNode contains currentNode at a deeper level,
 *          Sets that child as the new parent to check.
 *
 * Then if no equality was found,
 *      Returns the result of canDeiterate between the new parent to check and its level.
 *
 * Otherwise returns false.
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
