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

    setLegal();
}

/**
 * Determines the lowest node containing the current point and if that is not the sheet it is
 * considered a legal node and will be highlighted.
 * @param event A mouse move event while using deiteration tool
 */
export function deiterationMouseMove(event: MouseEvent) {
    const currentPoint: Point = new Point(event.x - offset.x, event.y - offset.y);
    currentNode = currentProofTree.getLowestNode(currentPoint);
    redrawProof();

    setLegal();
}

/**
 * If the node we currently have is legal, find it's parent and remove the current node from it.
 * Push the new version of the tree onto the proof history array.
 * @param event A mouse up event while using deiteration tool
 */
export function deiterationMouseUp(event: MouseEvent) {
    if (legalNode) {
        const currentPoint: Point = new Point(event.x - offset.x, event.y - offset.y);
        if (
            currentNode !== null &&
            canDeiterate(currentProofTree.sheet, currentProofTree.getLevel(currentNode))
        ) {
            const currentParent: CutNode | null = currentProofTree.getLowestParent(currentPoint);
            if (currentParent instanceof CutNode) {
                currentParent.remove(currentPoint);
            }
            treeContext.proof.push(new ProofNode(currentProofTree, "Deiteration"));
        }
    }

    legalNode = false;
    redrawProof();
}

/**
 * Helper function to determine if the currently selected node is a legal node and highlight it.
 */
function setLegal() {
    if (
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

/**
 * Reset the current null and make this node illegal until it's selected again, redraws the screen.
 */
export function deiterationMouseOut() {
    legalNode = false;
    currentNode = null;
    redrawProof();
}

/**
 * Searches the tree for an equal match to the node we're attempting to delete/deiterate that is
 * not itself. It cannot go to a level lower than itself and it cannot search any cuts it is not
 * contained by. The Node we search for is the currently selected no currentNode.
 * @param currentParent The current node we are searching the children of
 * @param level The level the node we're searching for is located
 * @returns Whether or not this is a valid deiteration
 */
function canDeiterate(currentParent: CutNode, level: number): boolean {
    let potentialParent: CutNode | null = null;
    for (let i = 0; i < currentParent.children.length; i++) {
        //If both nodes are cuts, and they are equal then we have found a copy higher on the tree
        if (
            currentParent.children[i] instanceof CutNode &&
            currentNode instanceof CutNode &&
            currentNode.isEqualTo(currentParent.children[i] as CutNode) &&
            currentNode.ellipse !== (currentParent.children[i] as CutNode).ellipse
        ) {
            return true;
        } //If both nodes are atoms, and they both have the same identifier then they are equal
        else if (
            currentParent.children[i] instanceof AtomNode &&
            currentNode instanceof AtomNode &&
            (currentParent.children[i] as AtomNode).identifier === currentNode.identifier &&
            currentParent.children[i].toString() !== currentNode.toString()
        ) {
            return true;
        } //If this cut has the node we're looking for we want to recurse towards it, however
        //We want to still check the rest of this level so we do it afterwards.
        else if (
            currentParent.children[i] instanceof CutNode &&
            (currentParent.children[i] as CutNode).containsNode(currentNode!) &&
            currentProofTree.getLevel(currentParent.children[i]) < level
        ) {
            potentialParent = currentParent.children[i] as CutNode;
        }
    }

    //If we did find the parent of the node we're trying to find an equal of, we look at the next
    //closest node.
    if (potentialParent !== null) {
        return canDeiterate(potentialParent, level);
    }

    //If there was no equal found then we cannot deiterate.
    return false;
}
