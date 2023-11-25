/**
 * MORE MOVE
 * @author Dawn Moore
 */

import {AEGTree} from "../AEG/AEGTree";
import {Point} from "../AEG/Point";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {treeContext} from "../treeContext";
import {offset} from "../DrawModes/DragTool";
import {drawAtom, redrawTree} from "../DrawModes/DrawUtils";
import {legalColor, illegalColor} from "../Themes";
import {validateChildren, drawAltered, insertChildren, alterAtom} from "../DrawModes/EditModeUtils";

//The initial point the user pressed down.
let startingPoint: Point;

//The current node and its children we will be moving.
let currentNode: CutNode | AtomNode | null = null;

//The parent of the node we removed.
let currentParent: CutNode | null = null;

//Whether or not the node is allowed to be moved (not the sheet).
let legalNode: boolean;

//The tree of the current proof step
let currentProofTree: AEGTree;

export function proofMoveMultiMouseDown(event: MouseEvent) {
    currentProofTree = new AEGTree(treeContext.getLastProofStep().tree.sheet);
    startingPoint = new Point(event.x - offset.x, event.y - offset.y);
    currentNode = currentProofTree.getLowestNode(startingPoint);
    if (currentNode !== currentProofTree.sheet && currentNode !== null) {
        currentParent = currentProofTree.getLowestParent(startingPoint);
        if (currentParent !== null) {
            currentParent.remove(startingPoint);
        }
        legalNode = true;
    } else {
        legalNode = false;
    }
}

export function proofMoveMultiMouseMove(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );

        redrawTree(currentProofTree);
        if (currentNode instanceof CutNode) {
            const color = isLegal(
                currentNode,
                new Point(event.x - offset.x, event.y - offset.y),
                moveDifference
            )
                ? legalColor()
                : illegalColor();
            drawAltered(currentNode, color, moveDifference);
        } else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = alterAtom(currentNode, moveDifference);
            const color = isLegal(
                currentNode,
                new Point(event.x - offset.x, event.y - offset.y),
                moveDifference
            )
                ? legalColor()
                : illegalColor();
            drawAtom(tempAtom, color, true);
        }
    }
}

export function proofMoveMultiMouseUp(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );

        if (currentNode instanceof CutNode) {
            if (
                isLegal(
                    currentNode,
                    new Point(event.x - offset.x, event.y - offset.y),
                    moveDifference
                )
            ) {
                insertChildren(currentNode, moveDifference);
            } else {
                currentProofTree.insert(currentNode);
            }
        } else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = alterAtom(currentNode, moveDifference);

            if (
                isLegal(
                    currentNode,
                    new Point(event.x - offset.x, event.y - offset.y),
                    moveDifference
                )
            ) {
                currentProofTree.insert(tempAtom);
            } else {
                currentProofTree.insert(currentNode);
            }
        }
    }
    redrawTree(currentProofTree);
    legalNode = false;
}

export function proofMoveMultiMouseOut() {
    if (legalNode && currentNode !== null) {
        currentProofTree.insert(currentNode);
    }
    legalNode = false;
    redrawTree(currentProofTree);
}

function isLegal(currentNode: CutNode | AtomNode, currentPoint: Point, difference: Point): boolean {
    if (
        currentNode instanceof CutNode &&
        currentParent === currentProofTree.getLowestNode(currentPoint)
    ) {
        if (validateChildren(currentProofTree, currentNode, difference)) {
            return true;
        } else {
            return false;
        }
    } else if (currentNode instanceof AtomNode) {
        if (currentProofTree.canInsert(currentNode)) {
            return true;
        } else {
            return false;
        }
    }

    return false;
}
