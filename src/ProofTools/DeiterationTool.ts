import {AEGTree} from "../AEG/AEGTree";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {getCurrentProofTree} from "./ProofToolsUtils";
import {highlightNode, redrawProof, redrawTree} from "../SharedToolUtils/DrawUtils";
import {illegalColor} from "../Themes";
import {offset} from "../SharedToolUtils/DragTool";
import {Point} from "../AEG/Point";
import {ProofNode} from "../AEG/ProofNode";
import {reInsertNode} from "../SharedToolUtils/EditModeUtils";
import {treeContext} from "../treeContext";

/**
 * Tool to be used during proof mode to perform deiteration on subgraphs on an AEG
 * @author Dawn Moore
 * @author Anusha Tiwari
 */

//The node selected with the user mouse down.
let currentNode: CutNode | AtomNode | null = null;

//Whether or not the node is allowed to be moved (not the sheet).
let legalNode: boolean;

//A copy of the tree we are dealing with in this step
let tempTree: AEGTree;

//The point that the current mouse event is targeting
let currentPoint: Point;

//The current tree in the proof chain
let currentProofTree: AEGTree;

/**
 * Determines the lowest node containing the current point and if that is not the sheet is is
 * considered a legal node. If it can also deiterate highlight it and all of it's children.
 * @param event A Mouse up event while using the deiteration tool
 */
export function deiterationMouseDown(event: MouseEvent) {
    currentPoint = new Point(event.x - offset.x, event.y - offset.y);
    currentProofTree = getCurrentProofTree();
    tempTree = new AEGTree(currentProofTree.sheet);
    currentNode = currentProofTree.getLowestNode(currentPoint);

    setLegal();
}

/**
 * Determines the lowest node containing the current point and if that is not the sheet it is
 * considered a legal node and will be highlighted.
 * @param event A mouse move event while using deiteration tool
 */
export function deiterationMouseMove(event: MouseEvent) {
    currentPoint = new Point(event.x - offset.x, event.y - offset.y);
    if (currentNode !== null) {
        currentNode = currentProofTree.getLowestNode(currentPoint);
        redrawProof();
        setLegal();
    }
}

/**
 * If the node we currently have is legal, find it's parent and remove the current node from it.
 * Push the new version of the tree onto the proof history array.
 * @param event A mouse up event while using deiteration tool
 */
export function deiterationMouseUp(event: MouseEvent) {
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
            treeContext.pushToProof(new ProofNode(currentProofTree, "Deiteration"));
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
        legalNode = true;

        //Find the parent at the point we are on
        const tempParent = tempTree.getLowestParent(currentPoint);
        if (tempParent !== null) {
            //remove the node from the parent
            tempParent.remove(currentPoint);
        }

        //Draw the temp tree, from which the node we want to erase has been removed
        redrawTree(tempTree);
        //Highlight the node selected for deiteration in illegal color
        highlightNode(currentNode, illegalColor());
        //Insert it back into the temporary tree
        tempTree.insert(currentNode);
    } else {
        legalNode = false;
    }
}

/**
 * Reset the current null and make this node illegal until it's selected again, redraws the screen.
 */
export function deiterationMouseOut() {
    if (legalNode && currentNode !== null) {
        reInsertNode(tempTree, currentNode);
    }
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
