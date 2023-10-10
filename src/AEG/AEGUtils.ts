import {Ellipse} from "./Ellipse";
import {Point} from "./Point";
import {Rectangle} from "./Rectangle";

/**
 * Method that checks whether one shape overlaps another
 * @param newShape The new shape that might be overlapping the existing shape
 * @param existingShape The existing shape
 * @returns True, if the new shape overlaps the existing shape. Else, false
 */
export function shapesOverlaps(
    newShape: Rectangle | Ellipse,
    existingShape: Rectangle | Ellipse
): boolean {
    if (newShape instanceof Rectangle) {
        if (existingShape instanceof Rectangle) {
            //For rectangle-rectangle, check if their edges intersect
            return edgesIntersect(newShape, existingShape);
        } else {
            //For ellipse-rectangle collision, check if points on the ellipse are
            //within the rectangle
            const points: Point[] = getEllipsePoints(existingShape as Ellipse, 64);
            for (let i = 0; i < points.length; i++) {
                if (pointInRect(newShape as Rectangle, points[i])) {
                    return true;
                }
            }
            return false;
        }
    } else {
        if (existingShape instanceof Rectangle) {
            //For ellipse-rectangle collision, check if points on the ellipse are
            //within the rectangle
            const points: Point[] = getEllipsePoints(newShape as Ellipse, 64);
            for (let i = 0; i < points.length; i++) {
                if (pointInRect(existingShape as Rectangle, points[i])) {
                    return true;
                }
            }
            return false;
        } else {
            //For ellipse-ellipse collision, check if the rectangular bounding boxes intersect.
            //If they do, check if points of the new ellipse are within the current ellipse
            if (
                shapesOverlaps(
                    (newShape as Ellipse).boundingBox,
                    (existingShape as Ellipse).boundingBox
                ) ||
                shapeContains(
                    (existingShape as Ellipse).boundingBox,
                    (newShape as Ellipse).boundingBox
                )
            ) {
                //if there is an overlap, check if points along the ellipse curve overlap
                //this can be done by checking if points along the curve of this ellipse
                //are within the other ellipse
                const points: Point[] = getEllipsePoints(newShape, 64);
                for (let i = 0; i < points.length; i++) {
                    if (pointInEllipse(existingShape as Ellipse, points[i])) {
                        return true;
                    }
                }
            }
            return false;
        }
    }
}

/**
 * Method that checks whether a shape is contained within another
 * @param outerShape The outer shape
 * @param innerShape The inner shape, that might be contained in the outer shape
 * @return True, if shape1 contains shape2. Else, false.
 */
export function shapeContains(
    outerShape: Rectangle | Ellipse,
    innerShape: Rectangle | Ellipse
): boolean {
    if (outerShape instanceof Rectangle) {
        if (innerShape instanceof Rectangle) {
            //A rectangle contains a rectangle if all the corners of the inner rectangle are
            //within the outer rectangle
            const innerCorners: Point[] = (innerShape as Rectangle).getCorners();
            for (let i = 0; i < 4; i++) {
                if (!pointInRect(outerShape as Rectangle, innerCorners[i])) {
                    return false;
                }
            }
            return true;
        } else {
            //A rectangle contains an ellipse if all the widest coordinates of the ellipse are
            //within the rectangle
            const innerCoords: Point[] = getWidestCoordinates(innerShape as Ellipse);
            for (let i = 0; i < 4; i++) {
                if (!pointInRect(outerShape as Rectangle, innerCoords[i])) {
                    return false;
                }
            }
            return true;
        }
    } else {
        if (innerShape instanceof Rectangle) {
            //An ellipse contains a rectangle if all the corners of the rectangle are within
            //the ellipse
            const innerCorners = (innerShape as Rectangle).getCorners();
            for (let i = 0; i < 4; i++) {
                if (!pointInEllipse(outerShape as Ellipse, innerCorners[i])) {
                    return false;
                }
            }
            return true;
        } else {
            //An ellipse contains an ellipse if all the widest coordinates of the inner ellipse
            //are within the outer ellipse
            const innerCoords: Point[] = getEllipsePoints(innerShape as Ellipse, 64);
            //= getWidestCoordinates(innerShape as Ellipse);
            for (let i = 0; i < innerCoords.length; i++) {
                if (!pointInEllipse(outerShape as Ellipse, innerCoords[i])) {
                    return false;
                }
            }
            return true;
        }
    }
}

/**
 * Method that checks if any edges of this rectangle overlap with the other rectangle.
 * @param otherRect The other rectangle to be checked.
 * @returns True, if edges overlap. Else, false.
 * @todo This algo can and should be simplified to be less than 10 lines of code. -James-Oswald
 */
function edgesIntersect(shape1: Rectangle, shape2: Rectangle): boolean {
    const thisCorners = shape1.getCorners();
    const otherCorners = shape2.getCorners();

    if (thisCorners[0].y <= otherCorners[0].y && thisCorners[2].y >= otherCorners[0].y) {
        //The top edge of the other rectangle is within the horizontal boundaries
        //of this rectangle
        if (thisCorners[0].x <= otherCorners[0].x && thisCorners[1].x >= otherCorners[0].x) {
            //The left edge of the other rectangle is within the vertical boundaries
            //of this rectangle
            return true;
        } else if (
            //The left edge of this rectangle is within the vertical boundaries
            //of the other rectangle
            otherCorners[0].x <= thisCorners[0].x &&
            otherCorners[1].x >= thisCorners[0].x
        ) {
            return true;
        } else if (
            //The right edge of the other rectangle is within the vertical boundaries
            //of this rectangle
            thisCorners[0].x <= otherCorners[1].x &&
            thisCorners[1].x >= otherCorners[1].x
        ) {
            return true;
        } else if (
            //The right edge of this rectangle is within the vertical boundaries
            //of the other rectangle
            otherCorners[0].x <= thisCorners[1].x &&
            otherCorners[1].x >= thisCorners[1].x
        ) {
            return true;
        }

        return false;
    } else if (otherCorners[0].y <= thisCorners[0].y && otherCorners[2].y >= thisCorners[0].y) {
        //The top edge of this rectangle is within the horizontal boundaries
        //of the other rectangle
        if (thisCorners[0].x <= otherCorners[0].x && thisCorners[1].x >= otherCorners[0].x) {
            //The left edge of the other rectangle is within the vertical boundaries
            //of this rectangle
            return true;
        } else if (
            //The left edge of this rectangle is within the vertical boundaries
            //of the other rectangle
            otherCorners[0].x <= thisCorners[0].x &&
            otherCorners[1].x >= thisCorners[0].x
        ) {
            return true;
        } else if (
            //The right edge of the other rectangle is within the vertical boundaries
            //of this rectangle
            thisCorners[0].x <= otherCorners[1].x &&
            thisCorners[1].x >= otherCorners[1].x
        ) {
            return true;
        } else if (
            //The right edge of this rectangle is within the vertical boundaries
            //of the other rectangle
            otherCorners[0].x <= thisCorners[1].x &&
            otherCorners[1].x >= thisCorners[1].x
        ) {
            return true;
        }

        return false;
    } else if (thisCorners[0].y <= otherCorners[2].y && thisCorners[2].y >= otherCorners[2].y) {
        //The bottom edge of the other rectangle is within the horizontal boundaries
        //of this rectangle
        if (thisCorners[0].x <= otherCorners[0].x && thisCorners[1].x >= otherCorners[0].x) {
            //The left edge of the other rectangle is within the vertical boundaries
            //of this rectangle
            return true;
        } else if (
            //The left edge of this rectangle is within the vertical boundaries
            //of the other rectangle
            otherCorners[0].x <= thisCorners[0].x &&
            otherCorners[1].x >= thisCorners[0].x
        ) {
            return true;
        } else if (
            //The right edge of the other rectangle is within the vertical boundaries
            //of this rectangle
            thisCorners[0].x <= otherCorners[1].x &&
            thisCorners[1].x >= otherCorners[1].x
        ) {
            return true;
        } else if (
            //The right edge of this rectangle is within the vertical boundaries
            //of the other rectangle
            otherCorners[0].x <= thisCorners[1].x &&
            otherCorners[1].x >= thisCorners[1].x
        ) {
            return true;
        }

        return false;
    } else if (otherCorners[0].y <= thisCorners[2].y && otherCorners[2].y >= thisCorners[2].y) {
        //The bottom edge of this rectangle is within the horizontal boundaries
        //of the other rectangle
        if (thisCorners[0].x <= otherCorners[0].x && thisCorners[1].x >= otherCorners[0].x) {
            //The left edge of the other rectangle is within the vertical boundaries
            //of this rectangle
            return true;
        } else if (
            //The left edge of this rectangle is within the vertical boundaries
            //of the other rectangle
            otherCorners[0].x <= thisCorners[0].x &&
            otherCorners[1].x >= thisCorners[0].x
        ) {
            return true;
        } else if (
            //The right edge of the other rectangle is within the vertical boundaries
            //of this rectangle
            thisCorners[0].x <= otherCorners[1].x &&
            thisCorners[1].x >= otherCorners[1].x
        ) {
            return true;
        } else if (
            //The right edge of this rectangle is within the vertical boundaries
            //of the other rectangle
            otherCorners[0].x <= thisCorners[1].x &&
            otherCorners[1].x >= thisCorners[1].x
        ) {
            return true;
        }

        return false;
    }

    return false;
}

/**
 * Method that checks whether there is a point inside the given rectangle.
 * @param rect The given rectangle.
 * @param otherPoint The point that might be inside the given rectangle.
 * @returns True, if the point is completely inside the rectangle. Else, false.
 */
export function pointInRect(rect: Rectangle, point: Point): boolean {
    const rectCorners = rect.getCorners();

    return (
        rectCorners[0].x < point.x &&
        rectCorners[1].x > point.x &&
        rectCorners[0].y < point.y &&
        rectCorners[2].y > point.y
    );
}

/**
 * Method that checks whether a point is within the given ellipse.
 * @param ellipse The given ellipse
 * @param otherPoint The point that might be inside the given ellipse.
 * @returns True, if the point is inside the given ellipse. Else, false
 */
export function pointInEllipse(ellipse: Ellipse, point: Point): boolean {
    //(x-h)^2/rx^2 + (y-k)^2/ry^2 <= 1
    //(x, y) = new point
    //(h, k) = center

    const p: number = //Math.ceil(
        Math.pow(point.x - ellipse.center.x, 2) / Math.pow(ellipse.radiusX, 2) +
        Math.pow(point.y - ellipse.center.y, 2) / Math.pow(ellipse.radiusY, 2);
    //);

    return p < 1;
}

/**
 * An array containing the widest coordinates of the given ellipse, i.e. the coordinates along the
 * x-axis and y-axis of the ellipse.
 * @param ellipse The given ellipse.
 * @returns The coordinates of the ellipse.
 * The coordinates are in clockwise order such that:
 * 0 - Top most coordinate (Top along y-axis).
 * 1 - Right most coordinate (Right along x-axis).
 * 2 - Bottom most coordinate (Bottom along y-axis).
 * 3 - Left most coordinate (Left along x-axis).
 */
function getWidestCoordinates(ellipse: Ellipse): Point[] {
    return [
        new Point(ellipse.center.x, ellipse.center.y - ellipse.radiusY),
        new Point(ellipse.center.x + ellipse.radiusX, ellipse.center.y),
        new Point(ellipse.center.x, ellipse.center.y + ellipse.radiusY),
        new Point(ellipse.center.x - ellipse.radiusX, ellipse.center.y),
    ];
}

/**
 * Method to get the points along the bounding curve of the given ellipse
 * @param ellipse The given ellipse
 * @returns An array of points along the bounding curve of the ellipse
 */
function getEllipsePoints(ellipse: Ellipse, amount: number): Point[] {
    const points: Point[] = [];
    const pointDist = ellipse.radiusX / (amount / 4);

    points[0] = getWidestCoordinates(ellipse)[3];
    let x: number;
    let y: number;

    for (let i = 1; i < amount; i++) {
        if (i < amount / 2 + 1) {
            x = points[i - 1].x + pointDist;
            y = getCurvePoint(ellipse, x, 1);
        } else {
            x = points[i - 1].x - pointDist;
            y = getCurvePoint(ellipse, x, -1);
        }
        points[i] = new Point(x, y);
    }

    return points;
}

/**
 * Method that returns a point on the curve of the given ellipse for a given x coordinate
 * @param ellipse The given ellipse
 * @param x The x coordinate of the point
 * @param curveHalf Flag signifying the curve of the ellipse.
 * 1 for top curve, -1 for bottom curve
 * @returns A point along the curve
 */
function getCurvePoint(ellipse: Ellipse, x: number, curveHalf: number): number {
    return (
        curveHalf *
            ellipse.radiusY *
            Math.sqrt(1 - Math.pow((x - ellipse.center.x) / ellipse.radiusX, 2)) +
        ellipse.center.y
    );
}
