/**
 * Contains logic for deleting multiple nodes.
 * @author Ryan Reilly
 * @author Dawn Moore
 */
import {Point} from "./AEG/Point";
import {AtomNode} from "./AEG/AtomNode";
import {CutNode} from "./AEG/CutNode";
import {drawAtom} from "./AtomMode";
import {drawCut} from "./CutMode";
import {redrawCut, tree} from "./index";
import {illegalColor} from "./Themes";
import {offset} from "./DragMode";

const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
const res: CanvasRenderingContext2D | null = canvas.getContext("2d");
if (res === null) {
    throw Error("2d rendering context not supported.");
}
const ctx: CanvasRenderingContext2D = res;

//The initial point the user pressed down.
let startingPoint: Point;

//The node selected with the user mouse down.
let currentNode: CutNode | AtomNode | null = null;

//Whether or not the node is allowed to be moved (not the sheet).
let legalNode: boolean;

/**
 * Takes the Point the user clicked and stores it.
 * If the lowest node containing that Point isn't the Sheet of Assertion,
 * That node is stored as currentNode.
 * currentNode is marked with the "illegal" color while the user holds it.
 * @param event The event from which we will get the Point
 */
export function deleteMultiMouseDown(event: MouseEvent) {
    startingPoint = new Point(event.x, event.y);
    currentNode = tree.getLowestNode(startingPoint);

    if (currentNode !== tree.sheet && currentNode !== null) {
        legalNode = true;
        highlightChildren(currentNode, illegalColor());
    }
}

/**
 * If the user clicks on a node to delete it, but moves their mouse away,
 * That node will not be deleted. If the mouse was moved farther down or higher in the tree,
 * The removal will update accordingly.
 */
export function deleteMultiMouseMove(event: MouseEvent) {
    const newPoint: Point = new Point(event.x - offset.x, event.y - offset.x);
    const newNode: CutNode | AtomNode | null = tree.getLowestNode(newPoint);
    if (currentNode !== null && currentNode !== tree.getLowestNode(newPoint)) {
        legalNode = true;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawCut(tree.sheet, offset);
        if (newNode === tree.sheet || newNode === null) {
            currentNode = null;
            legalNode = false;
        } else {
            currentNode = newNode;
            highlightChildren(currentNode, illegalColor());
        }
    }
}

/**
 * Removes currentNode and sets all data back to default values.
 * @param event The mouse up event
 */
export function deleteMultiMouseUp(event: MouseEvent) {
    const newPoint: Point = new Point(event.x - offset.x, event.y - offset.x);
    if (legalNode) {
        const currentParent = tree.getLowestParent(newPoint);
        if (currentParent !== null) {
            currentParent.remove(newPoint);
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawCut(tree.sheet, offset);
    }
    currentNode = null;
    legalNode = false;
}

/**
 * If the mouse is held down and the user leaves canvas, we reset fields back to default.
 */
export function deleteMultiMouseOut() {
    currentNode = null;
    legalNode = false;
}

/**
 * Highlights all the children of the incoming node as the incoming color.
 * @param child The incoming node
 * @param color The incoming color
 */
function highlightChildren(child: AtomNode | CutNode, color: string) {
    if (child instanceof AtomNode) {
        drawAtom(child, color, true);
    } else if (child instanceof CutNode) {
        drawCut(child, color);
        for (let i = 0; i < child.children.length; i++) {
            highlightChildren(child.children[i], color);
        }
    }
}
