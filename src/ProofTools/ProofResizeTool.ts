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
import {drawCut, redrawTree} from "../DrawModes/DrawUtils";
import {legalColor, illegalColor} from "../Themes";
import {ProofNode} from "../AEG/ProofNode";
import {resizeCut, determineDirection} from "../DrawModes/ResizeTool";
import {ellipseLargeEnough} from "../DrawModes/CutTool";
import {proofCanInsert} from "./ProofMoveSingleTool";

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
                } else {
                    currentProofTree.insert(currentNode);
                }
            }
        }

        treeContext.proofHistory.push(new ProofNode(currentProofTree, "Resize Cut"));
        redrawTree(treeContext.getLastProofStep().tree);
        legalNode = false;
    }
}

export function proofResizeMouseOut() {
    if (legalNode && currentNode !== null) {
        currentProofTree.insert(currentNode);
    }
    legalNode = false;
    redrawTree(treeContext.getLastProofStep().tree);
}

function isLegal(currentCut: CutNode): boolean {
    return (
        currentProofTree.canInsert(currentCut) &&
        ellipseLargeEnough(currentCut.ellipse!) &&
        proofCanInsert(new AEGTree(currentProofTree.sheet), currentCut)
    );
}
