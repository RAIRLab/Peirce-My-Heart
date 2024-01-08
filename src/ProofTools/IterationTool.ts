/**
 * @file Contains methods for iterating nodes and subgraphs on the Proof Mode canvas.
 * When a node's position is described as being valid or not,
 * This means that we are determining if it can currently be inserted into the AEGTree without
 * intersection.
 *
 * @author Dawn Moore
 * @author Anusha Tiwari
 */

import * as EditModeUtils from "../SharedToolUtils/EditModeUtils";
import {AEGTree} from "../AEG/AEGTree";
import {AtomNode} from "../AEG/AtomNode";
import {
    changeCursorStyle,
    determineAndChangeCursorStyle,
    drawAtom,
    redrawProof,
} from "../SharedToolUtils/DrawUtils";
import {CutNode} from "../AEG/CutNode";
import {Ellipse} from "../AEG/Ellipse";
import {getCurrentProofTree} from "./ProofToolUtils";
import {illegalColor, legalColor} from "../Themes";
import {offset} from "../SharedToolUtils/DragTool";
import {Point} from "../AEG/Point";
import {ProofNode} from "../Proof/ProofNode";
import {TreeContext} from "../TreeContext";

//First Point the user clicks.
let startingPoint: Point;

//Node in question.
let currentNode: CutNode | AtomNode | null = null;

//Parent of currentNode.
let currentParent: CutNode | null = null;

//True if currentNode is not The Sheet of Assertion (i.e can be moved.)
let legalNode: boolean;

//AEGTree at the current Proof step.
let currentProofTree: AEGTree;

/**
 * Sets startingPoint according to the incoming MouseEvent.
 * Then sets all fields above accordingly.
 *
 * @param event Incoming MouseEvent.
 */
export function iterationMouseDown(event: MouseEvent): void {
    currentProofTree = getCurrentProofTree();
    startingPoint = new Point(event.x - offset.x, event.y - offset.y);
    currentNode = currentProofTree.getLowestNode(startingPoint);
    currentParent = currentProofTree.getLowestParent(startingPoint);
    legalNode = currentNode !== currentProofTree.sheet && currentNode !== null;

    if (legalNode) {
        changeCursorStyle("cursor: copy");
    }
}

/**
 * If legality is true,
 *      Redraws the proof,
 *      Alters currentNode according to the coordinates received by the incoming MouseEvent,
 *      Highlights currentNode and any of its children as the legal or illegal color based on
 *      their positions' validity.
 *
 * @param event Incoming MouseEvent.
 */
export function iterationMouseMove(event: MouseEvent): void {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );

        redrawProof();
        const currentPoint = new Point(event.x - offset.x, event.y - offset.y);
        const color = isLegal(moveDifference, currentPoint) ? legalColor() : illegalColor();
        if (currentNode instanceof CutNode) {
            EditModeUtils.drawAltered(currentNode, color, moveDifference);
        } else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = EditModeUtils.alterAtom(currentNode, moveDifference);
            drawAtom(tempAtom, color, true);
        }
        determineAndChangeCursorStyle(color, "cursor: grabbing", "cursor: no-drop");
    }
}

/**
 * If legality is true,
 *      Alters currentNode according to the coordinates received by the incoming MouseEvent, and
 *      Iterates the
 *      altered currentNode to a deeper level in the Proof Mode AEGTree and redraws the proof.
 *
 * @param event Incoming MouseEvent.
 */
export function iterationMouseUp(event: MouseEvent): void {
    if (legalNode) {
        changeCursorStyle("cursor: default");
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );

        if (isLegal(moveDifference, new Point(event.x - offset.x, event.y - offset.y))) {
            if (currentNode instanceof CutNode) {
                EditModeUtils.insertChildren(currentNode, moveDifference, currentProofTree);
            } else if (currentNode instanceof AtomNode) {
                const tempAtom: AtomNode = EditModeUtils.alterAtom(currentNode, moveDifference);
                currentProofTree.insert(tempAtom);
            }
            TreeContext.pushToProof(new ProofNode(currentProofTree, "Iteration"));
        }
    }
    redrawProof();
    legalNode = false;
}

/**
 * Sets cursor style and all fields to default values.
 */
export function iterationMouseOut(): void {
    changeCursorStyle("cursor: default");
    legalNode = false;
    redrawProof();
}

/**
 * Checks and returns if the latter incoming Point can be legally iterated to the former incoming
 * Point. If currentNode altered by the former incoming Point can be inserted into the sheet, or
 * currentNode is a CutNode that is not a parent of the altered CutNode, then currentPoint can be
 * legally iterated.
 *
 * @param moveDifference Latter incoming Point.
 * @param currentPoint Former incoming Point.
 * @returns True if currentPoint can be legally iterated to moveDifference.
 */
function isLegal(moveDifference: Point, currentPoint: Point): boolean {
    return (
        currentParent !== null &&
        currentParent.containsPoint(currentPoint) &&
        ((currentNode instanceof CutNode &&
            EditModeUtils.validateChildren(currentProofTree, currentNode, moveDifference) &&
            isNotParent(
                currentProofTree.sheet,
                EditModeUtils.alterCut(currentNode, moveDifference).ellipse!
            )) ||
            (currentNode instanceof AtomNode &&
                currentProofTree.canInsert(EditModeUtils.alterAtom(currentNode, moveDifference))))
    );
}

/**
 * Checks and returns if the incoming Ellipse contains the incoming CutNode or any of the
 * incoming CutNode's children.
 *
 * If the incoming Ellipse contains any of currentNode's children, currentEllipse is then a parent.
 *
 * @param currentNode Incoming CutNode.
 * @param currentEllipse Incoming Ellipse.
 * @returns True if the currentEllipse does not contain currentNode or any of currentNode's
 *          children.
 */
function isNotParent(currentNode: CutNode, currentEllipse: Ellipse): boolean {
    for (let i = 0; i < currentNode.children.length; i++) {
        if (currentNode.children[i] instanceof CutNode) {
            if (
                (currentNode.children[i] as CutNode).ellipse instanceof Ellipse &&
                (currentEllipse.contains((currentNode.children[i] as CutNode).ellipse!) ||
                    !isNotParent(currentNode.children[i] as CutNode, currentEllipse))
            ) {
                return false;
            }
        } else if (
            currentNode.children[i] instanceof AtomNode &&
            currentEllipse.contains((currentNode.children[i] as AtomNode).calcRect())
        ) {
            return false;
        }
    }
    return true;
}
