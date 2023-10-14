/**
 * File containing drag based event functions.
 * @author Dawn Moore
 */

import {Point} from "./AEG/Point";
import {tree} from "./index";
import {redrawCut} from "./index";

const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
const res: CanvasRenderingContext2D | null = canvas.getContext("2d");
if (res === null) {
    throw Error("2d rendering context not supported");
}
const ctx: CanvasRenderingContext2D = res;

let originPoint: Point;
export let offSet: Point = new Point(0, 0); //No offset at the start

/**
 * Sets the origin point of the user's click so it can be compared for offset.
 * @param event The mouse down event in drag mode
 */
export function dragMouseDown(event: MouseEvent) {
    originPoint = new Point(event.x + offSet.x, event.y + offSet.y);
}

/**
 * Compares the origin point with the current point and calculate the current difference as offset.
 * @param event The mouse move event in drag mode
 */
export function dragMouseMove(event: MouseEvent) {
    offSet = new Point(originPoint.x - event.x, originPoint.y - event.y);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCut(tree.sheet, offSet);
}
