/**
 * File containing drag based event functions.
 * @author Dawn Moore
 */

import {Point} from "./AEG/Point";
import {tree} from "./index";
import {redrawCut} from "./index";

//Settings up Canvas
const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
const res: CanvasRenderingContext2D | null = canvas.getContext("2d");
if (res === null) {
    throw Error("2d rendering context not supported");
}
const ctx: CanvasRenderingContext2D = res;

//Original point later points will be compared to.
let originPoint: Point;

//Difference between real AEG coordinates and current canvas location.
export let offset: Point = new Point(0, 0);

//Tracks if the mouse has ever left canvas disallowing future movements.
let wasOut: boolean;

/**
 * Sets the origin point of the user's click so it can be compared for offset.
 * @param event The mouse down event in drag mode
 */
export function dragMouseDown(event: MouseEvent) {
    originPoint = new Point(event.x - offset.x, event.y - offset.y);
    wasOut = false;
}

/**
 * Compares the origin point with the current point and calculate the current difference as offset.
 * @param event The mouse move event in drag mode
 */
export function dragMouseMove(event: MouseEvent) {
    if (!wasOut) {
        offset = new Point(event.x - originPoint.x, event.y - originPoint.y);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        redrawCut(tree.sheet, offset);
    }
}

export function dragMosueOut() {
    wasOut = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCut(tree.sheet, offset);
}
