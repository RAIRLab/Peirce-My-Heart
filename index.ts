/**
 * A quick canvas test to see if my math was correct for creating an ellipse from two points
 * @author Dawn Moore
 */

/**
 * A type containing the X and Y position of a given point on a graph
 * positionX The x position of this point
 * positionY the y position of this point
 */
interface Point {
    positionX: number;
    positionY: number;
}

/**
 * A function to draw an ellipse between two points designated by the user
 * @param originalPoint the point where the user originally clicked
 * @param currentPoint the point where the user's mouse is currently located
 */
function drawEllipse(originalPoint : Point, currentPoint : Point){
    let center: Point = {
        positionX: ((currentPoint.positionX-originalPoint.positionX)/2) + originalPoint.positionX,
        positionY: ((currentPoint.positionY-originalPoint.positionY)/2) + originalPoint.positionY,
    };
    
    let radiusX: number = currentPoint.positionY - center.positionY;
    let radiusY: number = currentPoint.positionX - center.positionX;

    if(radiusX < 0){
        radiusX *= -1;
    }
    if (radiusY < 0){
        radiusY *= -1;
    }

    ctx.beginPath();
    ctx.ellipse(center.positionX, center.positionY, radiusX, radiusY, Math.PI / 2, 0, 2 * Math.PI); 
    ctx.stroke();
}

const canvas: any = document.getElementById("ellipses");
const ctx = canvas.getContext("2d");
let exampleStart: Point = {positionX: 20, positionY: 20};
let exampleEnd: Point = {positionX: 170, positionY: 120};
drawEllipse(exampleStart,exampleEnd);

//Test case to ensure negatives are taken care of
drawEllipse(exampleEnd,exampleStart);
