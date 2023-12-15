/**
 * A file containing single node resizing.
 */

import {Point} from "../AEG/Point";
import {ellipseLargeEnough, resizeCut} from "../SharedToolUtils/EditModeUtils";
import {AtomNode} from "../AEG/AtomNode";
import {changeCursorStyle, determineAndChangeCursorStyle} from "../SharedToolUtils/DrawUtils";
import {CutNode} from "../AEG/CutNode";
import {treeContext} from "../treeContext";
import {offset} from "../SharedToolUtils/DragTool";
import {drawCut, redrawTree, determineDirection} from "../SharedToolUtils/DrawUtils";
import {legalColor, illegalColor} from "../Themes";

//The initial point the user pressed down.
let startingPoint: Point;

//The node selected with the user mouse down.
let currentNode: CutNode | AtomNode | null = null;

//Whether or not the node is allowed to be moved (not the sheet).
let legalNode: boolean;

//The direction the cut will move in. For x 1 means going to the right and -1 means left.
//For y 1 means going down and -1 means going up.
let direction: Point = new Point(1, 1);

/**
 * Takes the point the user clicked and stores that for later use. If the lowest node containing
 * that point is not the sheet, then store that as currentNode and find that node's parent.
 * Removes the node from the parent and reinsert its children if it has any. Cannot be an Atom.
 * @param event The event of a mouse down while using resize tool
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
 * If the node is legal alters the center and both of the radii. Creates a copy of the current cut
 * So that the original is not altered in any way.
 * @param event The event of a mouse move while using the resize tool
 */
export function resizeMouseMove(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            (event.x - offset.x - startingPoint.x) / 2,
            (event.y - offset.y - startingPoint.y) / 2
        );

        if (currentNode instanceof CutNode) {
            const tempCut: CutNode = resizeCut(currentNode, moveDifference, direction);
            //This is just to make the lint stop yelling
            if (tempCut.ellipse !== null) {
                redrawTree(treeContext.tree);
                const legal =
                    treeContext.tree.canInsert(tempCut) && ellipseLargeEnough(tempCut.ellipse);
                const color = legal ? legalColor() : illegalColor();

                determineAndChangeCursorStyle(color, "cursor: crosshair", "cursor: no-drop");

                drawCut(tempCut, color);
            }
        }
    }
}

/**
 * If the node is legal creates a new temporary cut and alters the ellipse center and radii.
 * If this new cut can be inserted inserts that into the tree, otherwise reinserts the original.
 * @param event The event of a mouse up while using the resize tool
 */
export function resizeMouseUp(event: MouseEvent) {
    changeCursorStyle("cursor: default");
    if (legalNode) {
        const moveDifference: Point = new Point(
            (event.x - offset.x - startingPoint.x) / 2,
            (event.y - offset.y - startingPoint.y) / 2
        );

        if (currentNode instanceof CutNode) {
            const tempCut: CutNode = resizeCut(currentNode, moveDifference, direction);
            //This is just to make the lint stop yelling
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
 * If the mouse leaves the canvas then it is no longer a legal node and reinserts the original.
 */
export function resizeMouseOut() {
    changeCursorStyle("cursor: default");
    if (legalNode && currentNode !== null) {
        treeContext.tree.insert(currentNode);
    }
    legalNode = false;
    redrawTree(treeContext.tree);
}
