/**
 * @file Contains Draw Mode CutNode resizing methods.
 *
 * When it is said that a node is "removed" in the documentation,
 * this means that it is removed from the Draw Mode AEGTree but visually is still present.
 * When a CutNode's position is described as being valid or not,
 * this means that we are determining if it can currently be inserted into the AEGTree
 * without intersection.
 *
 * @author Dawn Moore
 */

import {AtomNode} from "../AEG/AtomNode";
import {changeCursorStyle, determineAndChangeCursorStyle} from "../SharedToolUtils/DrawUtils";
import {CutNode} from "../AEG/CutNode";
import {determineDirection, drawCut, redrawTree} from "../SharedToolUtils/DrawUtils";
import {ellipseLargeEnough, resizeCut} from "../SharedToolUtils/EditModeUtils";
import {illegalColor, legalColor} from "../Themes";
import {offset} from "../SharedToolUtils/DragTool";
import {Point} from "../AEG/Point";
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

/**
 * Sets startingPoint according to the coordinates given by the incoming MouseEvent.
 * Then currentNode is set to the lowest node containing startingPoint.
 * Then legality is set to true.
 * Then if currentNode is a CutNode, it is removed from the Draw Mode AEGTree and its children are inserted.
 * Then direction is calculated and set.
 *
 * @param event Incoming MouseEvent.
 */
export function drawResizeMouseDown(event: MouseEvent): void {
    startingPoint = new Point(event.x - offset.x, event.y - offset.y);
    currentNode = TreeContext.tree.getLowestNode(startingPoint);
    if (currentNode instanceof CutNode && currentNode.ellipse !== null) {
        legalNode = true;
        const currentParent = TreeContext.tree.getLowestParent(startingPoint);
        if (currentParent !== null) {
            currentParent.remove(startingPoint);
        }

        for (let i = 0; i < currentNode.children.length; i++) {
            TreeContext.tree.insert(currentNode.children[i]);
        }
        direction = determineDirection(currentNode, startingPoint);
        currentNode.children = [];
    }
}

/**
 * Alters the center and both radii of currentNode according to the coordinates given by the incoming MouseEvent.
 * This is done if and only if currentNode is legal and a CutNode.
 * Then the Draw Mode AEGTree is redrawn.
 * Then highlights currentNode according to its position's validity.
 * Highlight Color is legal only if currentNode can be inserted and is greater than the minimum radii values.
 *
 * @param event Incoming MouseEvent.
 */
export function drawResizeMouseMove(event: MouseEvent): void {
    if (legalNode) {
        const moveDifference: Point = new Point(
            (event.x - offset.x - startingPoint.x) / 2,
            (event.y - offset.y - startingPoint.y) / 2
        );
        if (currentNode instanceof CutNode) {
            const tempCut: CutNode = resizeCut(currentNode, moveDifference, direction);
            if (tempCut.ellipse !== null) {
                redrawTree(TreeContext.tree);
                const legal =
                    TreeContext.tree.canInsert(tempCut) && ellipseLargeEnough(tempCut.ellipse);
                const color = legal ? legalColor() : illegalColor();

                determineAndChangeCursorStyle(color, "cursor: crosshair", "cursor: no-drop");

                drawCut(tempCut, color);
            }
        }
    }
}

/**
 * Alters currentNode's center and radii according the coordinates given by the incoming MouseEvent.
 * This is done if and only if currentNode is legal and a CutNode.
 * Then this resized CutNode is inserted into the Draw Mode AEGTree if its position is valid.
 * Otherwise the original CutNode is inserted.
 * Then the Draw Mode AEGTree is redrawn.
 * Then legality is set to false.
 *
 * @param event Incoming MouseEvent.
 */
export function drawResizeMouseUp(event: MouseEvent): void {
    changeCursorStyle("cursor: default");
    if (legalNode) {
        const moveDifference: Point = new Point(
            (event.x - offset.x - startingPoint.x) / 2,
            (event.y - offset.y - startingPoint.y) / 2
        );
        if (currentNode instanceof CutNode) {
            const tempCut: CutNode = resizeCut(currentNode, moveDifference, direction);
            if (tempCut.ellipse !== null) {
                if (TreeContext.tree.canInsert(tempCut) && ellipseLargeEnough(tempCut.ellipse)) {
                    TreeContext.tree.insert(tempCut);
                } else {
                    TreeContext.tree.insert(currentNode);
                }
            }
        }
        redrawTree(TreeContext.tree);
        legalNode = false;
    }
}

/**
 * Reinserts the original currentNode if its legal.
 * Then marks legality as false.
 * Then redraws the Draw Mode AEGTree.
 */
export function drawResizeMouseOut(): void {
    changeCursorStyle("cursor: default");
    if (legalNode && currentNode !== null) {
        TreeContext.tree.insert(currentNode);
    }
    legalNode = false;
    redrawTree(TreeContext.tree);
}
