import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {determineDirection, drawCut, redrawTree} from "../SharedToolUtils/DrawUtils";
import {ellipseLargeEnough, resizeCut} from "../SharedToolUtils/EditModeUtils";
import {illegalColor, legalColor} from "../Themes";
import {offset} from "../SharedToolUtils/DragTool";
import {Point} from "../AEG/Point";
import {treeContext} from "../treeContext";

/**
 * Contains Draw Mode resizing methods.
 * @author Dawn Moore
 */

//First Point the user clicks.
let startingPoint: Point;

//Node in question.
let currentNode: CutNode | AtomNode | null = null;

//True if currentNode is not The Sheet of Assertion (i.e can be moved.)
let legalNode: boolean;

//Direction a CutNode will move in.
//For x, 1 means going right and -1 means left.
//For y, 1 means going down and -1 means going up.
//Defaults to going right and down according to the above details.
let direction: Point = new Point(1, 1);

/**
 * Sets startingPoint according to the coordinates given by the incoming MouseEvent.
 * currentNode and direction are set too.
 * If currentNode is a CutNode, it is removed from the Draw Mode AEGTree and its children are inserted.
 *
 * @param event Incoming MouseEvent.
 */
export function resizeMouseDown(event: MouseEvent) {
    startingPoint = new Point(event.x - offset.x, event.y - offset.y);
    currentNode = treeContext.tree.getLowestNode(startingPoint);
    if (currentNode instanceof CutNode && currentNode.ellipse !== null) {
        legalNode = true;
        const currentParent = treeContext.tree.getLowestParent(startingPoint);
        if (currentParent !== null) {
            currentParent.remove(startingPoint);
        }

        for (let i = 0; i < currentNode.children.length; i++) {
            treeContext.tree.insert(currentNode.children[i]);
        }
        direction = determineDirection(currentNode, startingPoint);
        currentNode.children = [];
    }
}

/**
 * Alters the center and both radii of currentNode according to the coordinates given by the incoming MouseEvent.
 * This is done if and only if currentNode is legal and a CutNode.
 * The Draw Mode AEGTree is then redrawn.
 * Highlighting colors are determined by whether the resized CutNode can be inserted or not.
 *
 * @param event Incoming MouseEvent.
 */
export function resizeMouseMove(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            (event.x - offset.x - startingPoint.x) / 2,
            (event.y - offset.y - startingPoint.y) / 2
        );

        if (currentNode instanceof CutNode) {
            const tempCut: CutNode = resizeCut(currentNode, moveDifference, direction);
            if (tempCut.ellipse !== null) {
                redrawTree(treeContext.tree);
                const legal =
                    treeContext.tree.canInsert(tempCut) && ellipseLargeEnough(tempCut.ellipse);
                const color = legal ? legalColor() : illegalColor();
                drawCut(tempCut, color);
            }
        }
    }
}

/**
 * Alters currentNode's center and radii according the coordinates given by the incoming MouseEvent.
 * This is done if and only if currentNode is legal and a CutNode.
 * This resized CutNode is inserted into the Draw Mode AEGTree if possible.
 * Otherwise the original CutNode is inserted.
 * The Draw Mode AEGTree is then redrawn.
 *
 * @param event The event of a mouse up while using the resize tool
 */
export function resizeMouseUp(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            (event.x - offset.x - startingPoint.x) / 2,
            (event.y - offset.y - startingPoint.y) / 2
        );

        if (currentNode instanceof CutNode) {
            const tempCut: CutNode = resizeCut(currentNode, moveDifference, direction);
            if (tempCut.ellipse !== null) {
                if (treeContext.tree.canInsert(tempCut) && ellipseLargeEnough(tempCut.ellipse)) {
                    treeContext.tree.insert(tempCut);
                } else {
                    treeContext.tree.insert(currentNode);
                }
            }
        }
        redrawTree(treeContext.tree);
        legalNode = false;
    }
}

/**
 * Marks legality as false, reinserts currentNode and redraws the Draw Mode AEGTree.
 */
export function resizeMouseOut() {
    if (legalNode && currentNode !== null) {
        treeContext.tree.insert(currentNode);
    }
    legalNode = false;
    redrawTree(treeContext.tree);
}
