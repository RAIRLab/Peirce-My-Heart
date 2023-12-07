/**
 * Deletes legal double cuts
 * @author Dawn Moore
 */

import {Point} from "../AEG/Point";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {drawCut, redrawProof} from "../DrawModes/DrawUtils";
import {treeContext} from "../treeContext";
import {illegalColor} from "../Themes";
import {offset} from "../DrawModes/DragTool";
import {ProofNode} from "../AEG/ProofNode";
import {AEGTree} from "../AEG/AEGTree";

//The node selected with the user mouse down.
let currentNode: CutNode | AtomNode | null = null;

//Whether or not the node is allowed to be moved (not the sheet).
let legalNode: boolean;

let currentProofTree: AEGTree;

/**
 * Takes the current point and finds the lowest node containing that point.
 * If that node is a double cut then it is a legal node and highlights it with the illegal color.
 * @param event The event of a mouse down while the user is using double cut deletion
 */
export function doubleCutDeletionMouseDown(event: MouseEvent) {
    const currentPoint: Point = new Point(event.x - offset.x, event.y - offset.y);
    currentProofTree = new AEGTree();
    if (treeContext.currentProofStep) {
        currentProofTree.sheet = treeContext.currentProofStep.tree.sheet.copy();
    }
    currentNode = currentProofTree.getLowestNode(currentPoint);

    isLegal();
}

/**
 * Selects a new current node and if that node is a legal double cut highlights the double cut.
 * Removes any previous highlighting.
 * @param event The event of a mouse move while the user is using double cut deletion
 */
export function doubleCutDeletionMouseMove(event: MouseEvent) {
    const currentPoint: Point = new Point(event.x - offset.x, event.y - offset.y);
    currentNode = currentProofTree.getLowestNode(currentPoint);
    redrawProof();

    isLegal();
}

/**
 * If the currentNode is legal, finds the parent and the lowerCut of the double cut.
 * Remove the outer cut from the parent and inserts all of the lowerCut's children back into the tree
 * @param event The event of a mouse up while the user is using double cut deletion
 */
export function doubleCutDeletionMouseUp(event: MouseEvent) {
    //Stores the tree of the previous proof so that we can perform double cut actions without
    //altering that tree
    const nextProof = new ProofNode(currentProofTree, "DC Delete");
    const currentPoint: Point = new Point(event.x - offset.x, event.y - offset.y);

    if (legalNode && currentNode instanceof CutNode) {
        const currentParent: CutNode | null = nextProof.tree.getLowestParent(currentPoint);
        const lowerCut: CutNode | AtomNode | null = currentNode.children[0];

        if (currentParent !== null && lowerCut instanceof CutNode) {
            currentParent.remove(currentPoint);
            for (let i = 0; i < lowerCut.children.length; i++) {
                nextProof.tree.insert(lowerCut.children[i]);
            }
            treeContext.pushToProof(nextProof);
        }
    }

    redrawProof();
}

/**
 * Resets the canvas if the mouse ends up out of the canvas.
 */
export function doubleCutDeletionMouseOut() {
    legalNode = false;
    redrawProof();
}

/**
 * Checks to see if the given cut is a legal double cut that only has another cut as its child
 * and is also not the sheet of assertion.
 * @param currentCut The outer cut of the double cut
 * @returns Whether or not the given cut is a double cut
 */
function isDoubleCut(currentCut: CutNode): Boolean {
    return (
        currentCut.children.length === 1 &&
        currentCut.children[0] instanceof CutNode &&
        currentNode !== currentProofTree.sheet
    );
}

/**
 * Highlights just the outer and inner cut of a double cut and not the inner cuts potential children.
 * @param parentCut The outer cut of a double cut
 */
function highlightDoubleCut(parentCut: CutNode) {
    drawCut(parentCut, illegalColor());
    if (parentCut.children[0] instanceof CutNode) {
        drawCut(parentCut.children[0], illegalColor());
    }
}

function isLegal() {
    if (currentNode instanceof CutNode && isDoubleCut(currentNode)) {
        legalNode = true;
        highlightDoubleCut(currentNode);
    } else {
        legalNode = false;
    }
}
