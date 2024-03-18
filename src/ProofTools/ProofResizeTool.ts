/**
 * @file Contains Proof Mode CutNode resizing methods.
 *
 * When it is said that a node is "removed" in the documentation,
 * this means that it is removed from the Draw Mode AEGTree but visually is still present.
 *
 * When a CutNode's position is described as being valid or not,
 * This means that we are determining if it can currently be inserted into the AEGTree without
 * intersection.
 *
 * @author Dawn Moore
 */

import {AEGTree} from "../AEG/AEGTree";
import {AtomNode} from "../AEG/AtomNode";
import {
    changeCursorStyle,
    determineAndChangeCursorStyle,
    determineDirection,
    drawCut,
    redrawProof,
    redrawTree,
} from "../SharedToolUtils/DrawUtils";
import {CutNode} from "../AEG/CutNode";
import {ellipseLargeEnough, resizeCut} from "../SharedToolUtils/EditModeUtils";
import {getCurrentProofTree, proofCanInsert} from "./ProofToolUtils";
import {illegalColor, legalColor} from "../Themes";
import {offset} from "../SharedToolUtils/DragTool";
import {Point} from "../AEG/Point";
import {ProofModeMove} from "../ProofHistory/ProofModeMove";
import {ProofModeNode} from "../ProofHistory/ProofModeNode";
import {TreeContext} from "../TreeContext";

//First Point the user clicks.
let startingPoint: Point;

//Node in question.
let currentNode: CutNode | AtomNode | null = null;

//True if currentNode is not The Sheet of Assertion (i.e can be resized.)
let legalNode: boolean;

//Direction a CutNode will move in.
//For x, 1 means going right and -1 means left.
//For y, 1 means going down and -1 means going up.
//Defaults to going right and down according to the above details.
let direction: Point = new Point(1, 1);

//AEGTree at the current proof step.
let currentProofTree: AEGTree;

/**
 * Sets startingPoint according to the coordinates given by the incoming MouseEvent.
 * Then sets currentNode to the lowest node containing startingPoint in currentProofTree
 * if currentNode is a CutNode.
 * Then removes currentNode.
 * Then inserts currentNode's children.
 * Then determines direction.
 *
 * @param event Incoming MouseEvent.
 */
export function proofResizeMouseDown(event: MouseEvent): void {
    currentProofTree = getCurrentProofTree();
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
 * Resizes currentNode according to the coordinates given by the incoming MouseEvent and direction.
 * Then redraws the resize as the legal or illegal color depending on its position's validity.
 *
 * @param event Incoming MouseEvent.
 */
export function proofResizeMouseMove(event: MouseEvent): void {
    if (legalNode) {
        const moveDifference: Point = new Point(
            (event.x - offset.x - startingPoint.x) / 2,
            (event.y - offset.y - startingPoint.y) / 2
        );

        if (currentNode instanceof CutNode) {
            const tempCut: CutNode = resizeCut(currentNode, moveDifference, direction);
            if (tempCut.ellipse !== null) {
                redrawTree(currentProofTree);
                const color = isValid(tempCut) ? legalColor() : illegalColor();
                drawCut(tempCut, color);
                determineAndChangeCursorStyle(color, "cursor: crosshair", "cursor: no-drop");
            }
        }
    }
}

/**
 * Resizes currentNode according to the coordinates given by the incoming MouseEvent and direction.
 * If this resize's position is valid, then it is inserted and added as a proof step.
 *
 * @param event Incoming MouseEvent.
 */
export function proofResizeMouseUp(event: MouseEvent): void {
    if (legalNode) {
        changeCursorStyle("cursor: default");
        const moveDifference: Point = new Point(
            (event.x - offset.x - startingPoint.x) / 2,
            (event.y - offset.y - startingPoint.y) / 2
        );

        if (currentNode instanceof CutNode) {
            const tempCut: CutNode = resizeCut(currentNode, moveDifference, direction);
            if (tempCut.ellipse !== null) {
                if (isValid(tempCut)) {
                    currentProofTree.insert(tempCut);
                    TreeContext.pushToProof(
                        new ProofModeNode(currentProofTree, ProofModeMove.RESIZE)
                    );
                }
            }
        }
        redrawProof();
        legalNode = false;
    }
}

/**
 * Reinserts currentNode into currentProofTree if necessary and sets fields to defaults.
 */
export function proofResizeMouseOut(): void {
    changeCursorStyle("cursor: default");
    if (legalNode && currentNode !== null) {
        currentProofTree.insert(currentNode);
    }
    legalNode = false;
    redrawProof();
}

/**
 * Checks and returns if the incoming CutNode is valid.
 *
 * A CutNode is valid if it can be inserted into an AEGTree,
 * And it is greater than the minimum Ellipse sizes,
 * And it can be inserted into currentProofTree.
 *
 * @see ellipseLargeEnough
 *
 * @param currentCut Incoming CutNode.
 * @returns True if, according to the above details, currentCut is legal.
 */
function isValid(currentCut: CutNode): boolean {
    return (
        currentProofTree.canInsert(currentCut) &&
        ellipseLargeEnough(currentCut.ellipse!) &&
        proofCanInsert(new AEGTree(currentProofTree.sheet), currentCut)
    );
}
