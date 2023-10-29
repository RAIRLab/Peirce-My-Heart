/**
 * A file containing single node resizing.
 */

import {Point} from "../AEG/Point";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {tree} from "../index";
import {offset} from "./DragMode";
import {drawCut, redrawTree} from "./DrawUtils";
import {legalColor, illegalColor} from "../Themes";
import {alterCut} from "./EditModeUtils";

//The initial point the user pressed down.
let startingPoint: Point;

//The node selected with the user mouse down.
let currentNode: CutNode | AtomNode | null = null;

//Whether or not the node is allowed to be moved (not the sheet).
let legalNode: boolean;

export function resizeMouseDown(event: MouseEvent) {
    startingPoint = new Point(event.x - offset.x, event.y - offset.y);
    currentNode = tree.getLowestNode(startingPoint);
    if (currentNode !== tree.sheet && currentNode instanceof CutNode) {
        legalNode = true;
        const currentParent = tree.getLowestParent(startingPoint);
        if (currentParent !== null) {
            currentParent.remove(startingPoint);
        }

        for (let i = 0; i < currentNode.children.length; i++) {
            tree.insert(currentNode.children[i]);
        }
        currentNode.children = [];
    }
}

export function resizeMouseMove(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );

        if (currentNode instanceof CutNode) {
            const tempCut: CutNode = alterCut(currentNode, moveDifference);
            //This is just to make the lint stop yelling
            if (tempCut.ellipse !== null) {
                tempCut.ellipse.radiusX = tempCut.ellipse.radiusX + moveDifference.x;
                tempCut.ellipse.radiusY = tempCut.ellipse.radiusY + moveDifference.y;
            }

            redrawTree(tree);
            const color = tree.canInsert(tempCut) ? legalColor() : illegalColor();
            drawCut(tempCut, color);
        }
    }
}

export function resizeMouseUp(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );

        if (currentNode instanceof CutNode) {
            const tempCut: CutNode = alterCut(currentNode, moveDifference);
            //This is just to make the lint stop yelling
            if (tempCut.ellipse !== null) {
                tempCut.ellipse.radiusX = tempCut.ellipse.radiusX + moveDifference.x;
                tempCut.ellipse.radiusY = tempCut.ellipse.radiusY + moveDifference.y;
            }

            if (tree.canInsert(tempCut)) {
                tree.insert(tempCut);
            } else {
                tree.insert(currentNode);
            }
        }
        redrawTree(tree);
        legalNode = false;
    }
}

export function resizeMouseOut() {
    if (legalNode && currentNode !== null) {
        tree.insert(currentNode);
    }
    legalNode = false;
    redrawTree(tree);
}
