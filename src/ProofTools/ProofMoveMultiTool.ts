/**
 * MORE MOVE
 * @author Dawn Moore
 */

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

//Whether or not the node is allowed to be moved (not the sheet).
let legalNode: boolean;

export function proofMoveMultiMouseDown(event: MouseEvent) {
    startingPoint = new Point(event.x - offset.x, event.y - offset.y);
    currentNode = treeContext.tree.getLowestNode(startingPoint);
    if (currentNode !== treeContext.tree.sheet && currentNode !== null) {
        const currentParent = treeContext.tree.getLowestParent(startingPoint);
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

        redrawTree(treeContext.tree);
        if (currentNode instanceof CutNode) {
            const color = validateChildren(currentNode, moveDifference)
                ? legalColor()
                : illegalColor();
            drawAltered(currentNode, color, moveDifference);
        } else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = alterAtom(currentNode, moveDifference);
            const color = treeContext.tree.canInsert(tempAtom) ? legalColor() : illegalColor();
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
            if (validateChildren(currentNode, moveDifference)) {
                insertChildren(currentNode, moveDifference);
            } else {
                treeContext.tree.insert(currentNode);
            }
        } else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = alterAtom(currentNode, moveDifference);

            if (treeContext.tree.canInsert(tempAtom)) {
                treeContext.tree.insert(tempAtom);
            } else {
                treeContext.tree.insert(currentNode);
            }
        }
    }
    redrawTree(treeContext.tree);
    legalNode = false;
}

export function proofMoveMultiMouseOut() {
    if (legalNode && currentNode !== null) {
        treeContext.tree.insert(currentNode);
    }
    legalNode = false;
    redrawTree(treeContext.tree);
}
