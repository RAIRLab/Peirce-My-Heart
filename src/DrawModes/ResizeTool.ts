/**
 * A file containing single node resizing.
 */

import {Point} from "../AEG/Point";
import {Ellipse} from "../AEG/Ellipse";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {treeContext} from "../treeContext";
import {offset} from "./DragTool";
import {drawCut, redrawTree} from "./DrawUtils";
import {legalColor, illegalColor} from "../Themes";
import {ellipseLargeEnough} from "./CutTool";

//The initial point the user pressed down.
let startingPoint: Point;

//The node selected with the user mouse down.
let currentNode: CutNode | AtomNode | null = null;

//Whether or not the node is allowed to be moved (not the sheet).
let legalNode: boolean;

//The direction the cut will move in. For x 1 means going to the right and -1 means left.
//For y 1 means going down and -1 means going up.
const direction: Point = new Point(1, 1);

/**
 * Takes the point the user clicked and stores that for later use. If the lowest node containing
 * that point is not the sheet, then store that as currentNode and find that node's parent.
 * Removes the node from the parent and reinsert its children if it has any. Cannot be an Atom.
 * @param event The event of a mouse down while using resize tool
 */
export function resizeMouseDown(event: MouseEvent) {
    startingPoint = new Point(event.x - offset.x, event.y - offset.y);
    currentNode = treeContext.tree.getLowestNode(startingPoint);
    if (currentNode !== treeContext.tree.sheet && currentNode instanceof CutNode) {
        legalNode = true;
        const currentParent = treeContext.tree.getLowestParent(startingPoint);
        if (currentParent !== null) {
            currentParent.remove(startingPoint);
        }

        for (let i = 0; i < currentNode.children.length; i++) {
            treeContext.tree.insert(currentNode.children[i]);
        }
        determineDirection();
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
            (event.x - startingPoint.x) / 2,
            (event.y - startingPoint.y) / 2
        );

        if (currentNode instanceof CutNode) {
            const tempCut: CutNode = resizeCut(currentNode, moveDifference);
            //This is just to make the lint stop yelling
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
 * If the node is legal creates a new temporary cut and alters the ellipse center and radii.
 * If this new cut can be inserted inserts that into the tree, otherwise reinserts the original.
 * @param event The event of a mouse up while using the resize tool
 */
export function resizeMouseUp(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            (event.x - startingPoint.x) / 2,
            (event.y - startingPoint.y) / 2
        );

        if (currentNode instanceof CutNode) {
            const tempCut: CutNode = resizeCut(currentNode, moveDifference);
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
    if (legalNode && currentNode !== null) {
        treeContext.tree.insert(currentNode);
    }
    legalNode = false;
    redrawTree(treeContext.tree);
}

/**
 * Makes a copy of original cut and changes the center and radii by the difference given.
 * Alters the change to the center based on the direction that is being moved to.
 * @param originalCut The original cut that will be copied and altered
 * @param difference The change for the new cut
 * @returns The new altered cut
 */
function resizeCut(originalCut: CutNode, difference: Point) {
    if (originalCut.ellipse !== null) {
        return new CutNode(
            new Ellipse(
                new Point(
                    originalCut.ellipse.center.x + difference.x - offset.x,
                    originalCut.ellipse.center.y + difference.y - offset.y
                ),
                originalCut.ellipse.radiusX + difference.x * direction.x,
                originalCut.ellipse.radiusY + difference.y * direction.y
            )
        );
    } else {
        throw new Error("Cannot alter the position of a cut without an ellipse.");
    }
}

/**
 * Determines which widest points the current point is closest to so that the resize
 * can move in that direction.
 * widestPoints[0] = leftmost widest point of the ellipse
 * widestPoints[1] = topmost widest point of the ellipse
 * widestPoints[2] = rightmost widest point of the ellipse
 * widestPoints[3] = bottommost widest point of the ellipse
 */
function determineDirection() {
    if (currentNode instanceof CutNode && (currentNode as CutNode).ellipse !== null) {
        const currentEllipse: Ellipse = currentNode.ellipse as Ellipse;
        const widestPoints: Point[] = [
            new Point(currentEllipse.center.x - currentEllipse.radiusX, currentEllipse.center.y),
            new Point(currentEllipse.center.x, currentEllipse.center.y - currentEllipse.radiusY),
            new Point(currentEllipse.center.x + currentEllipse.radiusX, currentEllipse.center.y),
            new Point(currentEllipse.center.x, currentEllipse.center.y + currentEllipse.radiusY),
        ];

        //If the current point is closer to the top or equal the direction is positive and going down
        if (widestPoints[0].distance(startingPoint) >= widestPoints[2].distance(startingPoint)) {
            direction.x = 1;
        } else {
            direction.x = -1;
        }

        //If the current point is closer to the left or equal the direction is positive and going right
        if (widestPoints[1].distance(startingPoint) >= widestPoints[3].distance(startingPoint)) {
            direction.y = 1;
        } else {
            direction.y = -1;
        }
    }
}
