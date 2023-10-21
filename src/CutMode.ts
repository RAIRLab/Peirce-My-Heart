/**
 * File containing cut based event functions.
 * @author Dawn Moore
 * @author James Oswald
 */

import {Point} from "./AEG/Point";
import {CutNode} from "./AEG/CutNode";
import {Ellipse} from "./AEG/Ellipse";
import {redrawCut} from "./index";
import {tree} from "./index";
import {offset} from "./DragMode";
import {legalColor, illegalColor} from "./Themes";

//Setting up Canvas
const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
const res: CanvasRenderingContext2D | null = canvas.getContext("2d");
const showRectElm: HTMLInputElement = <HTMLInputElement>document.getElementById("showRect");
const modeElm: HTMLSelectElement = <HTMLSelectElement>document.getElementById("mode");
if (res === null) {
    throw Error("2d rendering context not supported");
}
const ctx: CanvasRenderingContext2D = res;

//The point the ellipse is initially placed.
let startingPoint: Point;

//Tracks if the mouse has ever left canvas disallowing future movements.
let wasOut: boolean;

/**
 * Sets the starting point for the ellipse to where the user clicks.
 * @param event The mouse down event
 */
export function cutMouseDown(event: MouseEvent) {
    startingPoint = new Point(event.clientX - offset.x, event.clientY - offset.y);
    wasOut = false;
}

/**
 * Takes the current point of the ellipse and draws the ellipse between those two points.
 * Checks to see if the current point is valid to determine color.
 * Redraws the canvas then draws the ellipse.
 * @param event The mouse move event
 */
export function cutMouseMove(event: MouseEvent) {
    const newCut: CutNode = new CutNode(new Ellipse(new Point(0, 0), 0, 0));
    const currentPoint: Point = new Point(event.clientX - offset.x, event.clientY - offset.y);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCut(tree.sheet, offset);
    newCut.ellipse = createEllipse(startingPoint, currentPoint);

    if (!wasOut) {
        if (tree.canInsert(newCut) && ellipseLargeEnough(newCut.ellipse)) {
            drawEllipse(newCut, legalColor());
        } else {
            drawEllipse(newCut, illegalColor());
        }
    }
}

/**
 * Takes the current point of the mouse up event and if it is in a legal position adds it to the tree
 * Redraws the canvas, if the cut was legal it will be there on the new redraw.
 * @param event The mouse up event
 */
export function cutMouseUp(event: MouseEvent) {
    const currentPoint: Point = new Point(event.clientX - offset.x, event.clientY - offset.y);
    const newCut: CutNode = new CutNode(createEllipse(startingPoint, currentPoint));
    if (tree.canInsert(newCut) && !wasOut && ellipseLargeEnough(<Ellipse>newCut.ellipse)) {
        tree.insert(newCut);
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCut(tree.sheet, offset);
}

/**
 * Resets the canvas if the mouse ends up out of the canvas.
 */
export function cutMouseOut() {
    wasOut = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCut(tree.sheet, offset);
}

/**
 * A function to calculate an ellipse between two points designated by the user.
 * @param original the point where the user originally clicked
 * @param current the point where the user's mouse is currently located
 */
export function createEllipse(original: Point, current: Point): Ellipse {
    const center: Point = new Point(
        (current.x - original.x) / 2 + original.x,
        (current.y - original.y) / 2 + original.y
    );

    const sdx = original.x - current.x;
    const sdy = original.y - current.y;
    const dx = Math.abs(sdx);
    const dy = Math.abs(sdy);
    let rx, ry: number;

    if (modeElm.value === "circumscribed") {
        //This inscribed ellipse solution is inspired by the discussion of radius ratios in
        //https://stackoverflow.com/a/433426/6342516
        const rv: number = Math.floor(center.distance(current));
        ry = Math.floor(rv * (dy / dx));
        rx = Math.floor(rv * (dx / dy));
    } else {
        rx = dx / 2;
        ry = dy / 2;
    }

    if (showRectElm.checked) {
        ctx.beginPath();
        ctx.rect(original.x + offset.x, original.y + offset.y, -sdx, -sdy);
        ctx.stroke();
    }

    return new Ellipse(center, rx, ry);
}

/**
 * Draws the given cut onto the canvas.
 * @param thisCut The cut containing the ellipse to be drawn
 * @param color the line color of the ellipse
 */
function drawEllipse(thisCut: CutNode, color: string) {
    ctx.strokeStyle = color;
    const ellipse: Ellipse = <Ellipse>thisCut.ellipse;
    const center: Point = ellipse.center;
    ctx.beginPath();
    ctx.ellipse(
        center.x + offset.x,
        center.y + offset.y,
        ellipse.radiusX,
        ellipse.radiusY,
        0,
        0,
        2 * Math.PI
    );
    ctx.stroke();
}

/**
 * Checks to see if the given ellipse is large enough to be considered legal.
 * @param ellipse The ellipse to be checked
 * @returns Whether the given ellipse is large enough to be legal
 */
function ellipseLargeEnough(ellipse: Ellipse) {
    if (ellipse.radiusX > 15 && ellipse.radiusY > 15) {
        return true;
    }
    return false;
}
