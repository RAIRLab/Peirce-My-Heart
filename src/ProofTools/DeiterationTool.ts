/**
 * Tool to be used during proof mode to perform deiteration on subgraphs on an AEG
 * @author Dawn Moore
 */

import {Point} from "../AEG/Point";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {redrawProof} from "../DrawModes/DrawUtils";
import {treeContext} from "../treeContext";
import {illegalColor} from "../Themes";
import {offset} from "../DrawModes/DragTool";
import {ProofNode} from "../AEG/ProofNode";
import {AEGTree} from "../AEG/AEGTree";
import {highlightChildren} from "../DrawModes/EditModeUtils";

//The node selected with the user mouse down.
let currentNode: CutNode | AtomNode | null = null;

//Whether or not the node is allowed to be moved (not the sheet).
let legalNode: boolean;

//The current tree in the proof chain
let currentProofTree: AEGTree;

/**
 * Determines the lowest node containing the current point and if that is not the sheet is is
 * considered a legal node. If it can also deiterate highlight it and all of it's children.
 * @param event A Mouse up event while using the deiteration tool
 */
export function deiterationMouseDown(event: MouseEvent) {
    const currentPoint: Point = new Point(event.x - offset.x, event.y - offset.y);
    currentProofTree = new AEGTree(treeContext.getLastProofStep().tree.sheet);
    currentNode = currentProofTree.getLowestNode(currentPoint);

    if (currentNode !== null && !(currentNode instanceof CutNode && currentNode.ellipse === null)) {
        legalNode = true;

        if (canDeiterate(currentProofTree.sheet, currentProofTree.getLevel(currentNode))) {
            highlightChildren(currentNode, illegalColor());
        }
    } else {
        legalNode = false;
    }
}

/**
 * Determines the lowest node containging the current point and if that is not the sheet it is
 * considered a legal node
 * @param event A mouse move event while using deiteration tool
 */
export function deiterationMouseMove(event: MouseEvent) {
    const currentPoint: Point = new Point(event.x - offset.x, event.y - offset.y);
    currentNode = currentProofTree.getLowestNode(currentPoint);
    redrawProof();

    if (
        legalNode &&
        currentNode !== null &&
        !(currentNode instanceof CutNode && currentNode.ellipse === null) &&
        canDeiterate(currentProofTree.sheet, currentProofTree.getLevel(currentNode))
    ) {
        highlightChildren(currentNode, illegalColor());
        legalNode = true;
    } else {
        legalNode = false;
    }
}

export function deiterationMouseUp(event: MouseEvent) {
    //Stores the tree of the previous proof so that we can perform double cut actions without
    //altering that tree
    const currentPoint: Point = new Point(event.x - offset.x, event.y - offset.y);

    if (legalNode) {
        currentNode = currentProofTree.getLowestNode(currentPoint);
        if (
            currentNode !== null &&
            canDeiterate(currentProofTree.sheet, currentProofTree.getLevel(currentNode))
        ) {
            const currentParent: CutNode | null = currentProofTree.getLowestParent(currentPoint);
            if (currentParent instanceof CutNode) {
                currentParent.remove(currentPoint);
            }
        }
        treeContext.proofHistory.push(new ProofNode(currentProofTree, "Deiteration"));
    }

    legalNode = false;
    redrawProof();
}

export function deiterationMouseOut() {
    legalNode = false;
    redrawProof();
}

function canDeiterate(currentLevel: CutNode, level: number): boolean {
    for (let i = 0; i < currentLevel.children.length; i++) {
        //If both nodes are cuts, and they are equal then we have found a copy higher on the tree
        if (
            currentLevel.children[i] instanceof CutNode &&
            currentNode instanceof CutNode &&
            currentNode.isEqualTo(currentLevel.children[i] as CutNode) &&
            currentNode.ellipse !== (currentLevel.children[i] as CutNode).ellipse
        ) {
            return true;
        } //If both nodes are atoms, and they both have the same identifier then they are equal
        else if (
            currentLevel.children[i] instanceof AtomNode &&
            currentNode instanceof AtomNode &&
            (currentLevel.children[i] as AtomNode).identifier === currentNode.identifier &&
            currentLevel.children[i].toString() !== currentNode.toString()
        ) {
            return true;
        }
    }

    for (let i = 0; i < currentLevel.children.length; i++) {
        if (
            currentLevel.children[i] instanceof CutNode &&
            (currentLevel.children[i] as CutNode).containsNode(currentNode!) &&
            currentProofTree.getLevel(currentLevel.children[i]) < level
        ) {
            return canDeiterate(currentLevel.children[i] as CutNode, level);
        }
    }

    //If there was no equal found then we cannot deiterate.
    return false;
}
