/**
 * A program to draw ellipses using mouse clicks
 * @author Dawn Moore
 * @author James Oswald
 */

const showRectElm: HTMLInputElement = <HTMLInputElement>document.getElementById("showRect");
const modeElm: HTMLSelectElement = <HTMLSelectElement>document.getElementById("mode");
const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("ellipses");
const res: CanvasRenderingContext2D | null = canvas.getContext("2d");
if (res === null) {
    throw Error("2d rendering context not supported");
}
const ctx: CanvasRenderingContext2D = res;
const xshift: number = canvas.getBoundingClientRect().x;
const yshift: number = canvas.getBoundingClientRect().y;
let startingPoint: Point;

/**
 * A type containing the X and Y position of a given point on a graph
 * x The x position of this point
 * y the y position of this point
 */
interface Point {
    x: number;
    y: number;
}

function distance(p1: Point, p2: Point): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * A function to draw an ellipse between two points designated by the user
 * @param original the point where the user originally clicked
 * @param current the point where the user's mouse is currently located
 */
function drawEllipse(original: Point, current: Point) {
    const center: Point = {
        x: (current.x - original.x) / 2 + original.x,
        y: (current.y - original.y) / 2 + original.y,
    };

    const sdx = original.x - current.x;
    const sdy = original.y - current.y;
    const dx = Math.abs(sdx);
    const dy = Math.abs(sdy);
    let rx, ry: number;

    if (modeElm.value === "circumscribed") {
        //This inscribed ellipse solution is inspired by the discussion of radius ratios in
        //https://stackoverflow.com/a/433426/6342516
        const rv: number = Math.floor(distance(center, current));
        rx = Math.floor(rv * (dy / dx));
        ry = Math.floor(rv * (dx / dy));
    } else {
        ry = dx / 2;
        rx = dy / 2;
    }

    if (showRectElm.checked) {
        ctx.beginPath();
        ctx.rect(original.x, original.y, -sdx, -sdy);
        ctx.stroke();
    }

    ctx.beginPath();
    ctx.ellipse(center.x, center.y, rx, ry, Math.PI / 2, 0, 2 * Math.PI);
    ctx.stroke();
}

/**
 * A function to begin a mode to draw cuts. Currently no way to exit this once started.
 */
function ellipseMode() {
    document.getElementById("ellipses")?.addEventListener("mousedown", mouseDown);
}
window.ellipseMode = ellipseMode;

/**
 * Logs the position where the mouse is first pressed down. Begins the event for moving
 * the mouse, then ends it once mouseup occurs.
 * @param event The even of holding down the mouse
 */
function mouseDown(event: MouseEvent) {
    startingPoint = {x: event.clientX - xshift, y: event.clientY - yshift};
    document.getElementById("ellipses")?.addEventListener("mousemove", mouseMoving);
    document.getElementById("ellipses")?.addEventListener("mouseup", stopListening);
}

/**
 * Follows the current mouse position, and draws the ellipse between the starting
 * point and the current point.Clears the canvas with every movement. When the
 * tree is finished a redraw function will be made to draw all of the already
 * created cuts and atoms.
 * @param event The even of a mouse moving
 */
function mouseMoving(event: MouseEvent) {
    //As strange as this is, this is the only way to clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const currentPoint: Point = {
        x: event.clientX - xshift,
        y: event.clientY - yshift,
    };
    drawEllipse(startingPoint, currentPoint);
}

/**
 * Cancels the mouseMoving function after the mouse has been released.
 */
function stopListening() {
    document.getElementById("ellipses")?.removeEventListener("mousemove", mouseMoving);
}
