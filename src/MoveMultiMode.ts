/**
 * File containing multi node movement event handlers.
 * @author Dawn Moore
 */

import {Point} from "./AEG/Point";
import {AtomNode} from "./AEG/AtomNode";
import {CutNode} from "./AEG/CutNode";
import {redrawCut, tree} from "./index";
import {offset} from "./DragMode";
import {drawEllipse} from "./CutMode";
import {drawAtom} from "./AtomMode";

//Setting Up Canvas
const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
const res: CanvasRenderingContext2D | null = canvas.getContext("2d");
if (res === null) {
    throw Error("2d rendering context not supported");
}
const ctx: CanvasRenderingContext2D = res;

//The initial point the user pressed down.
let startingPoint: Point;
let currentNode: CutNode | AtomNode;

export function moveMultiMouseDown(event: MouseEvent) {
    startingPoint = new Point(event.x, event.y);
}

export function moveMultiMouseMove(event: MouseEvent) {
    const currentPoint: Point = new Point(event.x, event.y);
}

export function moveMultiMouseUp(event: MouseEvent) {
    const currentPoint: Point = new Point(event.x, event.y);
}

export function moveMultiMouseOut() {
    //
}
