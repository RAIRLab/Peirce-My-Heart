/**
 * @file Contains methods for moving one or more nodes at a time.
 *
 * When a node's position is described as being valid or not, this means that we are determining
 * if it can currently be inserted into the AEGTree without intersection.
 *
 * @author Dawn Moore
 * @author Anusha Tiwari
 */

import * as EditModeUtils from "../SharedToolUtils/EditModeUtils";
import {AtomNode} from "../AEG/AtomNode";
import {changeCursorStyle, determineAndChangeCursorStyle} from "../SharedToolUtils/DrawUtils";
import {CutNode} from "../AEG/CutNode";
import {drawAtom, highlightNode, redrawTree} from "../SharedToolUtils/DrawUtils";
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
 * Then sets currentNode to the lowest node containing startingPoint.
 * Then removes currentNode.
 * Then sets legality to true.
 * Then redraws the Draw Mode AEGTree.
 * Then highlights currentNode the legal color.
 *
 * @param event Incoming MouseEvent.
 */
export function drawMoveMultiMouseDown(event: MouseEvent): void {
    startingPoint = new Point(event.x - offset.x, event.y - offset.y);
    currentNode = TreeContext.tree.getLowestNode(startingPoint);
    if (currentNode !== TreeContext.tree.sheet && currentNode !== null) {
        changeCursorStyle("cursor: grabbing");
        const currentParent = TreeContext.tree.getLowestParent(startingPoint);
        if (currentParent !== null) {
            currentParent.remove(startingPoint);
        }
        legalNode = true;
        redrawTree(TreeContext.tree);
        highlightNode(currentNode, legalColor());
    } else {
        legalNode = false;
    }
}

/**
 * Draws an altered currentNode according to the coordinates given by the incoming MouseEvent.
 * Then highlights currentNode according to the legality of it and its children's positions' validity.
 *
 * @param event Incoming MouseEvent.
 */
export function drawMoveMultiMouseMove(event: MouseEvent): void {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );

        redrawTree(TreeContext.tree);
        if (currentNode instanceof CutNode) {
            const color = EditModeUtils.validateChildren(
                TreeContext.tree,
                currentNode,
                moveDifference
            )
                ? legalColor()
                : illegalColor();
            EditModeUtils.drawAltered(currentNode, color, moveDifference);
            determineAndChangeCursorStyle(color, "cursor: grabbing", "cursor: no-drop");
        } else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = EditModeUtils.alterAtom(currentNode, moveDifference);
            const color = TreeContext.tree.canInsert(tempAtom) ? legalColor() : illegalColor();
            drawAtom(tempAtom, color, true);
            determineAndChangeCursorStyle(color, "cursor: grabbing", "cursor: no-drop");
        }
    }
}

/**
 * Sets currentNode according to the coordinates given by the incoming MouseEvent.
 * Then inserts currentNode into the Draw Mode AEGTree if the positions of it and all its children are legal.
 * Otherwise inserts the original currentNode.
 * Then sets legality to false.
 * Then redraws the Draw Mode AEGTree.
 *
 * @param event Incoming MouseEvent.
 */
export function drawMoveMultiMouseUp(event: MouseEvent): void {
    changeCursorStyle("cursor: default");
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );
        if (currentNode instanceof CutNode) {
            if (EditModeUtils.validateChildren(TreeContext.tree, currentNode, moveDifference)) {
                EditModeUtils.insertChildren(currentNode, moveDifference);
            } else {
                TreeContext.tree.insert(currentNode);
            }
        } else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = EditModeUtils.alterAtom(currentNode, moveDifference);
            if (TreeContext.tree.canInsert(tempAtom)) {
                TreeContext.tree.insert(tempAtom);
            } else {
                TreeContext.tree.insert(currentNode);
            }
        }
    }
    redrawTree(TreeContext.tree);
    legalNode = false;
}

/**
 * Reinserts the original currentNode and all its children.
 * Then sets legality to false.
 * Then redraws the canvas.
 */
export function drawMoveMultiMouseOut(): void {
    changeCursorStyle("cursor: default");
    if (legalNode && currentNode !== null) {
        TreeContext.tree.insert(currentNode);
    }
    legalNode = false;
    redrawTree(TreeContext.tree);
}
