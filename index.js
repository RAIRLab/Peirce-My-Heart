/**
 * A program to draw ellipses using mouse clicks
 * @author Dawn Moore
 */
/**
 * A function to draw an ellipse between two points designated by the user
 * @param originalPoint the point where the user originally clicked
 * @param currentPoint the point where the user's mouse is currently located
 */
function drawEllipse(originalPoint, currentPoint) {
    var center = {
        x: ((currentPoint.x - originalPoint.x) / 2) + originalPoint.x,
        y: ((currentPoint.y - originalPoint.y) / 2) + originalPoint.y,
    };
    var radiusX = currentPoint.y - center.y;
    var radiusY = currentPoint.x - center.x;
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
    var _a;
    (_a = document.getElementById("ellipses")) === null || _a === void 0 ? void 0 : _a.addEventListener("mousedown", mouseDown);
}
/**
 * Logs the position where the mouse is first pressed down. Begins the event for moving the mouse, then ends it once mouseup occurs.
 * @param event The even of holding down the mouse
 */
function mouseDown(event) {
    var _a, _b;
    startingPoint = { x: event.clientX - xshift, y: event.clientY - yshift };
    (_a = document.getElementById("ellipses")) === null || _a === void 0 ? void 0 : _a.addEventListener("mousemove", mouseMoving);
    (_b = document.getElementById("ellipses")) === null || _b === void 0 ? void 0 : _b.addEventListener("mouseup", stopListening);
}
/**
 * Follows the current mouse position, and draws the ellipse between the starting point and the current point.
 * Clears the canvas with every movement.
 * *When the tree is finished a redraw function will be made to draw all of the already created cuts and atoms.*
 * @param event The even of a mouse moving
 */
function mouseMoving(event) {
    //As strange as this is, this is the only way to clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var currentPoint = { x: event.clientX - xshift, y: event.clientY - yshift };
    drawEllipse(startingPoint, currentPoint);
    ctx.stroke();
}
/**
 * Cancels the mouseMoving function after the mouse has been released.
 */
function stopListening() {
    var _a;
    (_a = document.getElementById("ellipses")) === null || _a === void 0 ? void 0 : _a.removeEventListener("mousemove", mouseMoving);
}
var canvas = document.getElementById("ellipses");
var ctx = canvas.getContext("2d");
var xshift = canvas.getBoundingClientRect().x;
var yshift = canvas.getBoundingClientRect().y;
var startingPoint;
