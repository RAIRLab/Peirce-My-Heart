/**
 * Contains logic for deleting one node.
 * @author Ryan Reilly
 */

import {Point} from "./AEG/Point";
import {AtomNode} from "./AEG/AtomNode";
import {CutNode} from "./AEG/CutNode";
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

let startingPoint: Point;
let currentNode: CutNode | AtomNode | null = null;
let legalNode: boolean;

/**
 * Takes the Point the user clicked and stores it.
 * If the lowest node containing that Point isn't the Sheet of Assertion,
 * That node is stored as currentNode.
 * currentNode is marked with the "illegal" color while the user holds it.
 * @param event The event from which we will get the Point
 */
export function deleteSingleMouseDown(event: MouseEvent) {
    startingPoint = new Point(event.x, event.y);
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
 */
export function deleteSingleMouseMove() {
    currentNode = null; //ONLY KEEPING THIS HERE FOR THE INITIAL COMMIT BEFORE UPDATING
}

/**
 * Removes currentNode and sets all data back to default values.
 * @param event The mouse up event
 */
export function deleteSingleMouseUp(event: MouseEvent) {
    tree.remove(startingPoint);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCut(tree.sheet, new Point(0, 0));
    currentNode = null;
    legalNode = false;
}

export function deleteSingleMouseOut() {
    currentNode = null;
    legalNode = false;
}
