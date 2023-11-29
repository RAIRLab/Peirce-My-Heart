/**
 * Resize tool to be used during Proof Mode
 * @author Dawn Moore
 */

import {AEGTree} from "../AEG/AEGTree";
import {Point} from "../AEG/Point";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {treeContext} from "../treeContext";
import {offset} from "../DrawModes/DragTool";
import {drawCut, redrawProof, redrawTree} from "../DrawModes/DrawUtils";
import {legalColor, illegalColor} from "../Themes";
import {ProofNode} from "../AEG/ProofNode";
import {resizeCut} from "../DrawModes/EditModeUtils";
import {determineDirection} from "../DrawModes/DrawUtils";
import {ellipseLargeEnough} from "../DrawModes/CutTool";
import {proofCanInsert} from "./ProofMoveUtils";

//The initial point the user pressed down.
let startingPoint: Point;

//The node selected with the user mouse down.
let currentNode: CutNode | AtomNode | null = null;

//Whether or not the node is allowed to be moved (not the sheet).
let legalNode: boolean;

//The direction the cut will move in. For x 1 means going to the right and -1 means left.
//For y 1 means going down and -1 means going up.
let direction: Point = new Point(1, 1);

//The tree of the current proof step
let currentProofTree: AEGTree;

/**
 * Takes the point the user clicked and stores that for later use. If the lowest node containing
 * that point is not the sheet, then store that as currentNode and find that node's parent.
 * Removes the node from the parent and reinsert its children if it has any. Cannot be an Atom.
 * @param event The mouse down even while using resize tool in proof mode
 */
export function proofResizeMouseDown(event: MouseEvent) {
    currentProofTree = new AEGTree(treeContext.getLastProofStep().tree.sheet);
    startingPoint = new Point(event.x - offset.x, event.y - offset.y);
    currentNode = currentProofTree.getLowestNode(startingPoint);

    if (currentNode instanceof CutNode && currentNode.ellipse !== null) {
        legalNode = true;
        const currentParent = currentProofTree.getLowestParent(startingPoint);
        if (currentParent !== null) {
            currentParent.remove(startingPoint);
        }

        for (let i = 0; i < currentNode.children.length; i++) {
            currentProofTree.insert(currentNode.children[i]);
        }
        direction = determineDirection(currentNode, startingPoint);
        currentNode.children = [];
    }
}

/**
 * If the node is legal alters the center and both of the radii. Creates a copy of the current cut
 * So that the original is not altered in any way.
 * @param event The mouse move event while the resize tool is being used in proof mode
 */
export function proofResizeMouseMove(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            (event.x - offset.x - startingPoint.x) / 2,
            (event.y - offset.y - startingPoint.y) / 2
        );

        if (currentNode instanceof CutNode) {
            const tempCut: CutNode = resizeCut(currentNode, moveDifference, direction);
            //This is just to make the lint stop yelling
            if (tempCut.ellipse !== null) {
                redrawTree(currentProofTree);
                const color = isLegal(tempCut) ? legalColor() : illegalColor();
                drawCut(tempCut, color);
            }
        }
    }
}

/**
 * If the node is legal creates a new temporary cut and alters the ellipse center and radii.
 * If this new cut can be inserted inserts that into the tree, otherwise reinserts the original.
 * @param event The mouse up event while using resize tool in proof mode
 */
export function proofResizeMouseUp(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            (event.x - offset.x - startingPoint.x) / 2,
            (event.y - offset.y - startingPoint.y) / 2
        );

        if (currentNode instanceof CutNode) {
            const tempCut: CutNode = resizeCut(currentNode, moveDifference, direction);
            //This is just to make the lint stop yelling
            if (tempCut.ellipse !== null) {
                if (isLegal(tempCut)) {
                    currentProofTree.insert(tempCut);
                    treeContext.proof.push(new ProofNode(currentProofTree, "Resize Cut"));
                    redrawProof();
                }
            }
        }
        redrawProof();
        legalNode = false;
    }
}

/**
 * If the mouse leaves the canvas then it is no longer a legal node and reinserts the original.
 */
export function proofResizeMouseOut() {
    if (legalNode && currentNode !== null) {
        currentProofTree.insert(currentNode);
    }
    legalNode = false;
    redrawTree(treeContext.getLastProofStep().tree);
}

/**
 * Determines if a node in a given position is legal if it can be inserted, is bigger than our
 * minimum ellipse radii size, and can be inserted into the tree without changing the structure.
 * @param currentCut The cut to be checked to see if it is legal
 * @returns Whether or not the cut in this position is legal
 */
function isLegal(currentCut: CutNode): boolean {
    return (
        currentProofTree.canInsert(currentCut) &&
        ellipseLargeEnough(currentCut.ellipse!) &&
        proofCanInsert(new AEGTree(currentProofTree.sheet), currentCut)
    );
}
