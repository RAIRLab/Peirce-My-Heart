/**
 * Contains logic for deleting one node.
 * @author Ryan Reilly
 */

import {Point} from "./AEG/Point";
import {AtomNode} from "./AEG/AtomNode";
import {CutNode} from "./AEG/CutNode";
import {offset} from "./DragMode";
import {drawAtom} from "./AtomMode";
import {drawCut} from "./CutMode";
import {redrawCut, tree} from "./index";
import {illegalColor} from "./Themes";

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
export function deleteSingleMouseDown(event: MouseEvent) {
    startingPoint = new Point(event.x - offset.x, event.y - offset.y);
    currentNode = tree.getLowestNode(startingPoint);

    if (currentNode !== tree.sheet && currentNode !== null) {
        legalNode = true;
        if (currentNode instanceof AtomNode) {
            drawAtom(currentNode, illegalColor(), true);
        } else {
            drawCut(currentNode, illegalColor());
        }
    }
}

/**
 * If the user clicks on a node to delete it, but moves their mouse away,
 * The node will not be deleted and all stored data will be set back to default values.
 * @param event The mouse move event
 */
export function deleteSingleMouseMove(event: MouseEvent) {
    const newPoint: Point = new Point(event.x - offset.x, event.y - offset.x);
    const newNode: CutNode | AtomNode | null = tree.getLowestNode(newPoint);
    if (currentNode !== null && currentNode !== newNode) {
        if (newNode === tree.sheet || newNode === null) {
            currentNode = null;
            legalNode = false;
        } else {
            currentNode = newNode;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawCut(tree.sheet, offset);
    }
}

/**
 * Removes currentNode and sets all data back to default values.
 * @param event The mouse up event
 */
export function deleteSingleMouseUp(event: MouseEvent) {
    const newPoint: Point = new Point(event.x - offset.x, event.y - offset.x);
    if (legalNode) {
        const currentParent = tree.getLowestParent(newPoint);
        if (currentParent !== null) {
            currentParent.remove(newPoint);
        }
        if (currentNode instanceof CutNode && currentNode.children.length !== 0) {
            //The cut node loses custody of its children so that those can still be redrawn.
            for (let i = 0; i < currentNode.children.length; i++) {
                tree.insert(currentNode.children[i]);
            }
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawCut(tree.sheet, offset);
    }
    currentNode = null;
    legalNode = false;
}

/**
 * If the mouse leaves the canvas, reset data back to defaults.
 */
export function deleteSingleMouseOut() {
    currentNode = null;
    legalNode = false;
}
