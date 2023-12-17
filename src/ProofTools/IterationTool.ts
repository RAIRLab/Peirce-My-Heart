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
import {ProofNode} from "../AEG/ProofNode";
import {TreeContext} from "../TreeContext";

/**
 * Contains methods for iterating nodes and subgraphs on the Proof Mode canvas.
 *
 * When a node's position is described as being valid or not,
 * This means that we are determining if it can currently be inserted into the AEGTree without intersection.
 *
 * @author Dawn Moore
 * @author Anusha Tiwari
 */

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
 * Sets currentProofTree to the current proof tree.
 * Then sets startingPoint according to the incoming MouseEvent.
 * Then sets currentNode to the lowest node containing startingPoint.
 * Then sets currentParent to the lowest parent containing startingPoint.
 * Then sets legality to true if currentNode is not The Sheet of Assertion or null.
 *
 * Then if legality is true,
 *      Sets cursor style to copy.
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
 *      Highlights currentNode and any of its children as the legal or illegal color based on its position's validity, and
 *      Changes cursor style according to the highlight color.
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
 *      Sets cursor style to default,
 *      Then if currentNode altered by the coordinates received from the incoming MouseEvent's position is legal,
 *          Inserts currentNode and any of its children, and
 *          Adds an Iteration step to the proof history.
 * Then redraws the proof.
 * Then sets legality to false.
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
 * Sets cursor style to default.
 * Then sets legality to false.
 * Then redraws the proof.
 */
export function iterationMouseOut(): void {
    changeCursorStyle("cursor: default");
    legalNode = false;
    redrawProof();
}

/**
 * Checks and returns if the latter incoming Point can be legally iterated to the former incoming Point.
 *
 * If currentParent is not null, and
 *      currentParent contains the former current Point, and
 *          If currentNode is a CutNode and currentNode's children are valid, and
 *              currentNode altered by the latter incoming Point is not a parent, or
 *          currentNode is an AtomNode and currentNode altered by the latter incoming Point can be inserted into currentProofTree,
 *
 *      Returns true.
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
 * Checks and returns if the incoming altered Ellipse contains the incoming CutNode or any of the incoming CutNode's children.
 *
 * As long as the incoming CutNode has children,
 *      If the incoming altered Ellipse contains the incoming CutNode's child or that child is a parent,
 *          Returns false.
 *      Otherwise if the incoming altered Ellipse contains a child of the incoming CutNode that is an AtomNode,
 *          Returns false.
 * Otherwise returns true.
 *
 * @param currentNode Incoming CutNode.
 * @param currentEllipse Incoming Ellipse.
 * @returns True if the currentEllipse does not contain currentNode or any of currentNode's children.
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
