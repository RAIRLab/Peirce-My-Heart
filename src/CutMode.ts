import {Point} from "./AEG/Point";
import {CutNode} from "./AEG/CutNode";
import {Ellipse} from "./AEG/Ellipse";
import {redrawCut} from "./index";
import {tree} from "./index";

const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
const res: CanvasRenderingContext2D | null = canvas.getContext("2d");
const showRectElm: HTMLInputElement = <HTMLInputElement>document.getElementById("showRect");
const modeElm: HTMLSelectElement = <HTMLSelectElement>document.getElementById("mode");
if (res === null) {
    throw Error("2d rendering context not supported");
}
const ctx: CanvasRenderingContext2D = res;

let currentEllipse: Ellipse = new Ellipse();
let startingPoint: Point = new Point();

/**
 * Sets the starting point for the ellipse to where the user clicks.
 * @param event The mouse down event
 */
export function cutMouseDown(event: MouseEvent) {
    startingPoint.x = event.clientX;
    startingPoint.y = event.clientY;
}

/**
 * Takes the current point of the ellipse and draws the ellipse between those two points.
 * Checks to see if the current point is valid to determine color.
 * Redraws the canvas then draws the ellipse.
 * @param event The mouse move event
 */
export function cutMouseMove(event: MouseEvent) {
    const newCut: CutNode = new CutNode();
    const currentPoint: Point = new Point();
    currentPoint.x = event.clientX;
    currentPoint.y = event.clientY;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCut(tree.sheet);
    currentEllipse = createEllipse(startingPoint, currentPoint);
    newCut.ellipse = currentEllipse;

    if (tree.canInsert(newCut) && currentEllipse.radiusX > 15 && currentEllipse.radiusY > 15) {
        drawEllipse(newCut, "#00FF00");
    } else {
        drawEllipse(newCut, "#FF0000");
    }
}

/**
 * Takes the current point of the mouse up event and if it is in a legal position adds it to the tree
 * Redraws the canvas, if the cut was legal it will be there on the new redraw.
 * @param event The mouse up event
 */
export function cutMouseUp(event: MouseEvent) {
    let newCut: CutNode = new CutNode();
    const currentPoint: Point = new Point();
    currentPoint.x = event.clientX;
    currentPoint.y = event.clientY;
    currentEllipse = createEllipse(startingPoint, currentPoint);
    newCut = new CutNode(currentEllipse);
    if (tree.canInsert(newCut) && currentEllipse.radiusX > 15 && currentEllipse.radiusY > 15) {
        tree.insert(newCut);
    }
    startingPoint = new Point();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCut(tree.sheet);
    console.log(tree.toString());
}

/**
 * Resets the canvas if the mouse ends up out of the canvas.
 */
export function cutMouseOut() {
    startingPoint = new Point();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    redrawCut(tree.sheet);
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
        ctx.rect(original.x, original.y, -sdx, -sdy);
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
    ctx.ellipse(center.x, center.y, ellipse.radiusX, ellipse.radiusY, 0, 0, 2 * Math.PI);
    ctx.stroke();
}
