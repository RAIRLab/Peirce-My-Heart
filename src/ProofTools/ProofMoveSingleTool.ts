/**
 * Something something moving
 * @author Dawn Moore
 */

import {Point} from "../AEG/Point";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {treeContext} from "../treeContext";
import {offset} from "../DrawModes/DragTool";
import {drawCut, drawAtom, redrawTree} from "../DrawModes/DrawUtils";
import {legalColor, illegalColor} from "../Themes";
import {alterAtom, alterCut} from "../DrawModes/EditModeUtils";

//The initial point the user pressed down.
let startingPoint: Point;

//The node selected with the user mouse down.
let currentNode: CutNode | AtomNode | null = null;

//The parent of the node we removed.
let currentParent: CutNode | null = null;

//Whether or not the node is allowed to be moved (not the sheet).
let legalNode: boolean;

export function proofMoveSingleMouseDown(event: MouseEvent) {
    startingPoint = new Point(event.x - offset.x, event.y - offset.y);
    currentNode = treeContext.tree.getLowestNode(startingPoint);
    if (currentNode !== treeContext.tree.sheet && currentNode !== null) {
        currentParent = treeContext.tree.getLowestParent(startingPoint);
        if (currentParent !== null) {
            currentParent.remove(startingPoint);
        }

        if (currentNode instanceof CutNode && currentNode.children.length !== 0) {
            //The cut node loses custody of its children so that those can still be redrawn.
            for (let i = 0; i < currentNode.children.length; i++) {
                treeContext.tree.insert(currentNode.children[i]);
            }
            currentNode.children = [];
        }
        legalNode = true;
    } else {
        legalNode = false;
    }
}

export function proofMoveSingleMouseMove(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );
        //If the node is a cut, and it has an ellipse, make a temporary cut and draw that.
        if (currentNode instanceof CutNode) {
            const tempCut: CutNode = alterCut(currentNode, moveDifference);

            redrawTree(treeContext.tree);
            const color = isLegal(tempCut, new Point(event.x - offset.x, event.y - offset.y))
                ? legalColor()
                : illegalColor();
            drawCut(tempCut, color);
        } //If the node is an atom, make a temporary atom and check legality, drawing that.
        else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = alterAtom(currentNode, moveDifference);
            redrawTree(treeContext.tree);
            const color = isLegal(tempAtom, new Point(event.x - offset.x, event.y - offset.y))
                ? legalColor()
                : illegalColor();
            drawAtom(tempAtom, color, true);
        }
    }
}

export function proofMoveSingleMouseUp(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );
        if (currentNode instanceof CutNode) {
            const tempCut: CutNode = alterCut(currentNode, moveDifference);

            //If the new location is legal, insert the cut otherwise reinsert the cut we removed.
            if (isLegal(tempCut, new Point(event.x - offset.x, event.y - offset.y))) {
                treeContext.tree.insert(tempCut);
            } else {
                treeContext.tree.insert(currentNode);
            }
        } else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = alterAtom(currentNode, moveDifference);

            //If the new location is legal, insert the atom, if not reinsert the atom we removed.
            if (isLegal(tempAtom, new Point(event.x - offset.x, event.y - offset.y))) {
                treeContext.tree.insert(tempAtom);
            } else {
                treeContext.tree.insert(currentNode);
            }
        }
        redrawTree(treeContext.tree);
    }
    legalNode = false;
}

export function proofMoveSingleMouseOut() {
    if (legalNode && currentNode !== null) {
        treeContext.tree.insert(currentNode);
    }
    legalNode = false;
    redrawTree(treeContext.tree);
}

function isLegal(currentNode: CutNode | AtomNode, currentPoint: Point): Boolean {
    if (
        currentParent === treeContext.tree.getLowestNode(currentPoint) &&
        treeContext.tree.canInsert(currentNode)
    ) {
        return true;
    } else {
        return false;
    }
}
