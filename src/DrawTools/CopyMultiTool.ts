/**
 * @file Contains methods for copying and pasting one or more nodes at a time.
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
import {drawAtom, redrawTree} from "../SharedToolUtils/DrawUtils";
import {DrawModeMove} from "../History/DrawModeMove";
import {illegalColor, legalColor} from "../Themes";
import {offset} from "../SharedToolUtils/DragTool";
import {Point} from "../AEG/Point";
import {TreeContext} from "../TreeContext";

//First Point the user clicks.
let startingPoint: Point;

//Node in question.
let currentNode: CutNode | AtomNode | null = null;

//True if currentNode is not The Sheet of Assertion or null (i.e can be copied and pasted.)
let legalNode: boolean;

/**
 * Sets startingPoint according to the coordinates given by the incoming MouseEvent.
 * Then sets currentNode to the lowest node containing startingPoint.
 *
 * @param event Incoming MouseEvent.
 */
export function copyMultiMouseDown(event: MouseEvent): void {
    startingPoint = new Point(event.x - offset.x, event.y - offset.y);
    currentNode = TreeContext.tree.getLowestNode(startingPoint);
    if (currentNode !== TreeContext.tree.sheet && currentNode !== null) {
        changeCursorStyle("cursor: copy");
        legalNode = true;
    } else {
        legalNode = false;
    }
}

/**
 * Alters currentNode according to the coordinates given by the incoming MouseEvent.
 * Then highlights the altered currentNode according to its and all its children's positions' validity.
 *
 * @param event Incoming MouseEvent.
 */
export function copyMultiMouseMove(event: MouseEvent): void {
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
 * Alters the position of currentNode according to the coordinates given by the incoming MouseEvent.
 * Then inserts the altered currentNode if its position is valid.
 * Then inserts any children of currentNode if their positions are valid.
 * Otherwise inserts the original currentNode.
 *
 * @param event Incoming MouseEvent.
 */
export function copyMultiMouseUp(event: MouseEvent): void {
    changeCursorStyle("cursor: default");
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );
        if (currentNode instanceof CutNode) {
            if (EditModeUtils.validateChildren(TreeContext.tree, currentNode, moveDifference)) {
                EditModeUtils.insertChildren(currentNode, moveDifference);
            }
        } else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = EditModeUtils.alterAtom(currentNode, moveDifference);
            if (TreeContext.tree.canInsert(tempAtom)) {
                TreeContext.tree.insert(tempAtom);
            }
        }

        TreeContext.pushToDrawStack(DrawModeMove.COPY_MULTI);
    }
    redrawTree(TreeContext.tree);
    legalNode = false;
}

/**
 * Sets legality to false.
 * Then redraws the Draw Mode AEGTree.
 */
export function copyMultiMouseOut(): void {
    changeCursorStyle("cursor: default");
    legalNode = false;
    redrawTree(TreeContext.tree);
}
