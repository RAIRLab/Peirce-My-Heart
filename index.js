/**
 * A quick canvas test to see if my math was correct for creating an ellipse from two points
 * @author Dawn Moore
 */
/**
 * A function to draw an ellipse between two points designated by the user
 * @param originalPoint the point where the user originally clicked
 * @param currentPoint the point where the user's mouse is currently located
 */
function drawEllipse(originalPoint, currentPoint) {
    var center = {
        positionX: ((currentPoint.positionX - originalPoint.positionX) / 2) + originalPoint.positionX,
        positionY: ((currentPoint.positionY - originalPoint.positionY) / 2) + originalPoint.positionY,
    };
    var radiusX = currentPoint.positionY - center.positionY;
    var radiusY = currentPoint.positionX - center.positionX;
    if (radiusX < 0) {
        radiusX *= -1;
    }
    if (radiusY < 0) {
        radiusY *= -1;
    }
    ctx.beginPath();
    ctx.ellipse(center.positionX, center.positionY, radiusX, radiusY, Math.PI / 2, 0, 2 * Math.PI);
    ctx.stroke();
}
var canvas = document.getElementById("ellipses");
var ctx = canvas.getContext("2d");
var exampleStart = { positionX: 20, positionY: 20 };
var exampleEnd = { positionX: 170, positionY: 120 };
drawEllipse(exampleStart, exampleEnd);
//Test case to ensure negatives are taken care of
drawEllipse(exampleEnd, exampleStart);
