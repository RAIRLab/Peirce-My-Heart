/**
 * A tool used to iterated subgraphs on the AEG
 * @author
 */

import {Point} from "../AEG/Point";
import {Ellipse} from "../AEG/Ellipse";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {treeContext} from "../treeContext";
import {offset} from "../DrawModes/DragTool";
import {drawAtom, redrawTree} from "../DrawModes/DrawUtils";
import {legalColor, illegalColor} from "../Themes";
import {
    validateChildren,
    drawAltered,
    insertChildren,
    alterAtom,
    alterCut,
} from "../DrawModes/EditModeUtils";

//The initial point the user pressed down.
let startingPoint: Point;

//The current node and its children we will be moving.
let currentNode: CutNode | AtomNode | null = null;

//The parent of the currentNode.
let currentParent: CutNode | null = null;

//Whether or not the node is allowed to be moved (not the sheet).
let legalNode: boolean;

/**
 * Sets the starting point for future use as well as obtaining the lowest node containing this point.
 * Also obtains the parent of this lowest point for future use as well.
 * @param event The mouse down event while using the iteration tool
 */
export function iterationMouseDown(event: MouseEvent) {
    startingPoint = new Point(event.x - offset.x, event.y - offset.y);
    currentNode = treeContext.tree.getLowestNode(startingPoint);
    currentParent = treeContext.tree.getLowestParent(startingPoint);

    //So long as we have obtained a node that isn't the sheet we are allowed to select this.
    legalNode = currentNode !== treeContext.tree.sheet && currentNode !== null;
}

/**
 * If we have selected a legal node then determines how far it has moved from the original node.
 * If it is a cut node determines if this new position is legal for all of its children and draws
 * that in its correct color. If it's an atom it just checks to see if that is in the correct position.
 * @param event The mouse move event while using the iteration tool
 */
export function iterationMouseMove(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );

        redrawTree(treeContext.tree);
        const currentPoint = new Point(event.x - offset.x, event.y - offset.y);
        const color = isLegal(moveDifference, currentPoint) ? legalColor() : illegalColor();
        if (currentNode instanceof CutNode) {
            drawAltered(currentNode, color, moveDifference);
        } else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = alterAtom(currentNode, moveDifference);
            drawAtom(tempAtom, color, true);
        }
    }
}

/**
 * Checks to see if the node and any of its children are illegal in the new position. If any are
 * illegal does not insert any of them. Redraws the canvas to update this.
 * @param event The mouse out event while using the iteration tool
 */
export function iterationMouseUp(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );

        if (isLegal(moveDifference, new Point(event.x - offset.x, event.y - offset.y))) {
            if (currentNode instanceof CutNode) {
                insertChildren(currentNode, moveDifference);
            } else if (currentNode instanceof AtomNode) {
                const tempAtom: AtomNode = alterAtom(currentNode, moveDifference);
                treeContext.tree.insert(tempAtom);
            }
        }
    }
    redrawTree(treeContext.tree);
    legalNode = false;
}

/**
 * If the mouse has left the canvas then assume it is now illegal and reset the tree.
 */
export function iterationMouseOut() {
    legalNode = false;
    redrawTree(treeContext.tree);
}

/**
 * If the current point is legally iterated (within the parent of the original node)
 * checks if the altered nodes can be inserted, if all of them can returns true.
 * @param moveDifference The change from the currentNodes original position
 * @param currentPoint The current point on the graph the mouse is
 * @returns Whether or not this location is legal
 */
function isLegal(moveDifference: Point, currentPoint: Point): boolean {
    //If the current parent exists and contains our current point then checks whether the node
    //Is an atom or cut for their own individual legality check.
    return (
        currentParent !== null &&
        currentParent.containsPoint(currentPoint) &&
        //If the currentNode is a cut, then it is legal if it and all if it's children can be placed
        //legally, and if the node we have selected can not be inserted over something else.
        ((currentNode instanceof CutNode &&
            validateChildren(currentNode, moveDifference) &&
            insertChildless(
                treeContext.tree.sheet,
                alterCut(currentNode, moveDifference).ellipse!
            )) ||
            //AtomNodes are legal if they can be inserted in their current location.
            (currentNode instanceof AtomNode &&
                treeContext.tree.canInsert(alterAtom(currentNode, moveDifference))))
    );
}

/**
 * Determines if the current location and shape of the ellipse would have any children in
 * it's current position, acts recursively for cut nodes starting with the sheet.
 * @param currentNode The current node we are checking in the recursive function starting with the sheet
 * @param currentEllipse The ellipse of the altered cut node we are trying to place
 * @returns Whether or not the node would have any children
 */
function insertChildless(currentNode: CutNode, currentEllipse: Ellipse): boolean {
    for (let i = 0; i < currentNode.children.length; i++) {
        if (currentNode.children[i] instanceof CutNode) {
            //So long as the ellipse is not null, and either our current cut or any of it's
            //Children have a child that is contained by our ellipse then it is false
            if (
                (currentNode.children[i] as CutNode).ellipse instanceof Ellipse &&
                (currentEllipse.contains((currentNode.children[i] as CutNode).ellipse!) ||
                    !insertChildless(currentNode.children[i] as CutNode, currentEllipse))
            ) {
                return false;
            }
        } else if (
            currentNode.children[i] instanceof AtomNode &&
            currentEllipse.contains((currentNode.children[i] as AtomNode).calcRect())
        ) {
            return false;
        }
    }

    return true;
}
