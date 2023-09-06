/**
 * A quick canvas test to see if my math was correct for creating an ellipse from two points
 * @author Dawn Moore
 */

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
function drawEllipse(originalPoint : Point, currentPoint : Point){
    let center: Point = {
        x: ((currentPoint.x-originalPoint.x)/2) + originalPoint.x,
        y: ((currentPoint.y-originalPoint.y)/2) + originalPoint.y,
    };
    
    let radiusX: number = currentPoint.y - center.y;
    let radiusY: number = currentPoint.x - center.x;

    if(radiusX < 0){
        radiusX *= -1;
    }
    if (radiusY < 0){
        radiusY *= -1;
    }

    ctx.beginPath();
    ctx.ellipse(center.x, center.y, radiusX, radiusY, Math.PI / 2, 0, 2 * Math.PI); 
}

const canvas: any = document.getElementById("ellipses");
const ctx = canvas.getContext("2d");
let exampleStart: Point = {x: 20, y: 20};
let exampleEnd: Point = {x: 170, y: 120};
drawEllipse(exampleStart,exampleEnd);

//Test case to ensure negatives are taken care of
drawEllipse(exampleEnd,exampleStart);
ctx.stroke();
