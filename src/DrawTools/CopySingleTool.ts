import {alterAtom, alterCut} from "../SharedToolUtils/EditModeUtils";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {drawAtom, drawCut, redrawTree} from "../SharedToolUtils/DrawUtils";
import {illegalColor, legalColor} from "../Themes";
import {offset} from "../SharedToolUtils/DragTool";
import {Point} from "../AEG/Point";
import {treeContext} from "../treeContext";

/**
 * File containing single copy movement event handlers.
 *
 * @author Dawn Moore
 * @author Anusha Tiwari
 */

//The initial point the user pressed down.
let startingPoint: Point;

//The node selected with the user mouse down.
let currentNode: CutNode | AtomNode | null = null;

//Whether or not the node is allowed to be moved (not the sheet).
let legalNode: boolean;

/**
 * Takes the point the user clicked and stores that for later use. If the lowest node containing
 * that point is not the sheet, then store that as currentNode.
 * @param event The mouse down event while in copySingle mode
 */
export function copySingleMouseDown(event: MouseEvent) {
    startingPoint = new Point(event.x - offset.x, event.y - offset.y);
    const realNode: CutNode | AtomNode | null = treeContext.tree.getLowestNode(startingPoint);
    const moveDifference: Point = new Point(event.x - startingPoint.x, event.y - startingPoint.y);
    if (realNode !== treeContext.tree.sheet && realNode !== null) {
        if (realNode instanceof CutNode) {
            //The cut node loses custody of its children because those do not copy over during
            //copy single mode
            currentNode = alterCut(realNode, moveDifference);
            currentNode.children = [];
        } else if (realNode instanceof AtomNode) {
            currentNode = realNode;
        }
        legalNode = true;
    } else {
        legalNode = false;
    }
}

/**
 * If the node is legal, and it wasn't out compare the difference between the start and the current.
 * If the node is a cut, creates a new cut with the altered center and checks to see if it can be
 * entered into the current location. If yes draws the cut legal color otherwise illegal color.
 * For atoms instead of altering the center it alters the origin position and does the same check.
 * @param event The mouse move event while in copySingle mode
 */
export function copySingleMouseMove(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );
        //If the node is a cut, and it has an ellipse, make a temporary cut and draw that.
        if (currentNode instanceof CutNode) {
            const tempCut: CutNode = alterCut(currentNode, moveDifference);

            redrawTree(treeContext.tree);
            const color = treeContext.tree.canInsert(tempCut) ? legalColor() : illegalColor();
            drawCut(tempCut, color);
        } //If the node is an atom, make a temporary atom and check legality, drawing that.
        else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = alterAtom(currentNode, moveDifference);

            redrawTree(treeContext.tree);
            const color = treeContext.tree.canInsert(tempAtom) ? legalColor() : illegalColor();
            drawAtom(tempAtom, color, true);
        }
    }
}

/**
 * If the node is legal, and the mouse has not been out compares the start and the current.
 * If the new temporary node is in a legal position inserts the temporary cut as the copied cut.
 * Otherwise copy failed and nothing is inserted.
 * @param event The mouse up event while in copySingle mode
 */
export function copySingleMouseUp(event: MouseEvent) {
    if (legalNode) {
        const moveDifference: Point = new Point(
            event.x - startingPoint.x,
            event.y - startingPoint.y
        );
        if (currentNode instanceof CutNode && currentNode.ellipse !== null) {
            const tempCut: CutNode = alterCut(currentNode, moveDifference);

            //If the new location is legal, insert the copied cut.
            if (treeContext.tree.canInsert(tempCut)) {
                treeContext.tree.insert(tempCut);
            }
        } else if (currentNode instanceof AtomNode) {
            const tempAtom: AtomNode = alterAtom(currentNode, moveDifference);

            //If the new location is legal, insert the copied atom.
            if (treeContext.tree.canInsert(tempAtom)) {
                treeContext.tree.insert(tempAtom);
            }
        }
        redrawTree(treeContext.tree);
    }
    legalNode = false;
}

/**
 * If the mouse is moved outside of the canvas, sets wasOut to true.
 * Redraws the canvas.
 */
export function copySingleMouseOut() {
    legalNode = false;
    redrawTree(treeContext.tree);
}
