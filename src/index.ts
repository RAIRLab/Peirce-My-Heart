/**
 * A program to draw ellipses using mouse clicks
 * @author Dawn Moore
 */

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

/**
 * A function to draw an ellipse between two points designated by the user
 * @param originalPoint the point where the user originally clicked
 * @param currentPoint the point where the user's mouse is currently located
 */
function drawEllipse(originalPoint: Point, currentPoint: Point) {
    const center: Point = {
        x: (currentPoint.x - originalPoint.x) / 2 + originalPoint.x,
        y: (currentPoint.y - originalPoint.y) / 2 + originalPoint.y,
    };

    let radiusX: number = currentPoint.y - center.y;
    let radiusY: number = currentPoint.x - center.x;

    if (radiusX < 0) {
        radiusX *= -1;
    }
    if (radiusY < 0) {
        radiusY *= -1;
    }

    ctx.beginPath();
    ctx.ellipse(center.x, center.y, radiusX, radiusY, Math.PI / 2, 0, 2 * Math.PI);
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
    ctx.stroke();
}

/**
 * Cancels the mouseMoving function after the mouse has been released.
 */
function stopListening() {
    document.getElementById("ellipses")?.removeEventListener("mousemove", mouseMoving);
}
