/**
 * @file
 * Contains methods for moving one node at a time.
 *
 * When a node's position is described as being valid or not, this means that we are determining
 * if it can currently be inserted into the AEGTree without intersection.
 *
 * @author Dawn Moore
 * @author Anusha Tiwari
 */

import {alterAtom, alterCut} from "../SharedToolUtils/EditModeUtils";
import {AtomNode} from "../AEG/AtomNode";
import {changeCursorStyle, determineAndChangeCursorStyle} from "../SharedToolUtils/DrawUtils";
import {CutNode} from "../AEG/CutNode";
import {drawAtom, drawCut, redrawTree} from "../SharedToolUtils/DrawUtils";
import {illegalColor, legalColor} from "../Themes";
import {offset} from "../SharedToolUtils/DragTool";
import {Point} from "../AEG/Point";
import {TreeContext} from "../TreeContext";

//First Point the user clicks.
let startingPoint: Point;

//Node in question.
let currentNode: CutNode | AtomNode | null = null;

//True if currentNode is not The Sheet of Assertion or null (i.e can be moved.)
let legalNode: boolean;

/**
 * Sets startingPoint according to the coordinates given by the incoming MouseEvent.
 * Then removes the lowest node containing startingPoint.
 * Then reinserts its children.
 * Then highlights currentNode the legal color.
 *
 * @param event Incoming MouseEvent.
 */
export function moveSingleMouseDown(event: MouseEvent): void {
    startingPoint = new Point(event.x - offset.x, event.y - offset.y);
    currentNode = TreeContext.tree.getLowestNode(startingPoint);
    if (currentNode !== TreeContext.tree.sheet && currentNode !== null) {
        changeCursorStyle("cursor: grabbing");
        const currentParent = TreeContext.tree.getLowestParent(startingPoint);
        if (currentParent !== null) {
            currentParent.remove(startingPoint);
        }

        if (currentNode instanceof CutNode && currentNode.children.length !== 0) {
            for (let i = 0; i < currentNode.children.length; i++) {
                TreeContext.tree.insert(currentNode.children[i]);
            }
            currentNode.children = [];
        }
        legalNode = true;

        redrawTree(TreeContext.tree);
        if (currentNode instanceof AtomNode) {
            drawAtom(currentNode, legalColor(), true);
        } else {
            drawCut(currentNode as CutNode, legalColor());
        }
    } else {
        legalNode = false;
    }
}

/**
 * Alters currentNode's position according to the coordinates given by the incoming MouseEvent.
 * Then redraws the Draw Mode AEGTree.
 * Then highlights currentNode according to the legality of its position.
 *
 * @param event Incoming MouseEvent.
 */
export function moveSingleMouseMove(event: MouseEvent): void {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );
        if (currentNode instanceof CutNode) {
            const tempCut: CutNode = alterCut(currentNode, moveDifference);
            redrawTree(TreeContext.tree);
            const color = TreeContext.tree.canInsert(tempCut) ? legalColor() : illegalColor();
            drawCut(tempCut, color);
            determineAndChangeCursorStyle(color, "cursor: grabbing", "cursor: no-drop");
        } //If the node is an atom, make a temporary atom and check legality, drawing that.
        else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = alterAtom(currentNode, moveDifference);
            redrawTree(TreeContext.tree);
            const color = TreeContext.tree.canInsert(tempAtom) ? legalColor() : illegalColor();
            drawAtom(tempAtom, color, true);
            determineAndChangeCursorStyle(color, "cursor: grabbing", "cursor: no-drop");
        }
    }
}

/**
 * Alters currentNode's position according to the coordinates given by the incoming MouseEvent.
 * Then inserts currentNode if its altered position is valid.
 * Otherwise reinserts the unaltered currentNode.
 *
 * @param event Incoming MouseEvent.
 */
export function moveSingleMouseUp(event: MouseEvent): void {
    changeCursorStyle("cursor: default");
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );
        if (currentNode instanceof CutNode) {
            const tempCut: CutNode = alterCut(currentNode, moveDifference);
            if (TreeContext.tree.canInsert(tempCut)) {
                TreeContext.tree.insert(tempCut);
            } else {
                TreeContext.tree.insert(currentNode);
            }
        } else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = alterAtom(currentNode, moveDifference);
            if (TreeContext.tree.canInsert(tempAtom)) {
                TreeContext.tree.insert(tempAtom);
            } else {
                TreeContext.tree.insert(currentNode);
            }
        }
        redrawTree(TreeContext.tree);
    }
    legalNode = false;
}

/**
 * Reinserts the original currentNode if legal.
 * Then sets legality to false.
 * Then redraws the canvas.
 */
export function moveSingleMouseOut(): void {
    changeCursorStyle("cursor: default");
    if (legalNode && currentNode !== null) {
        TreeContext.tree.insert(currentNode);
    }
    legalNode = false;
    redrawTree(TreeContext.tree);
}
