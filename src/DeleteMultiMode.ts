/**
 * Contains logic for deleting multiple nodes.
 * @author Ryan Reilly
 */
import {Point} from "./AEG/Point";
import {AtomNode} from "./AEG/AtomNode";
import {CutNode} from "./AEG/CutNode";
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
export function deleteMultiMouseDown(event: MouseEvent) {
    startingPoint = new Point(event.x, event.y);
    currentNode = null; //ONLY KEEPING THIS HERE FOR THE INITIAL COMMIT BEFORE UPDATING
}

/**
 * If the user clicks on a node to delete it, but moves their mouse away,
 * The node will not be deleted and all stored data will be set back to default values.
 */
export function deleteMultiMouseMove() {
    currentNode = null; //ONLY KEEPING THIS HERE FOR THE INITIAL COMMIT BEFORE UPDATING
}

/**
 * Removes currentNode and sets all data back to default values.
 * @param event The mouse up event
 */
export function deleteMultiMouseUp(event: MouseEvent) {
    tree.remove(new Point(0, 0)); //ONLY KEEPING THIS HERE FOR THE INITIAL COMMIT BEFORE UPDATING
    currentNode = null;
    legalNode = false;
}
