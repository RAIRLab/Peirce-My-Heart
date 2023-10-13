import {Ellipse} from "./Ellipse";
import {Point} from "./Point";
import {Rectangle} from "./Rectangle";

/**
 * Method that checks whether one shape overlaps another
 * @param newShape The new shape that might be overlapping the existing shape
 * @param existingShape The existing shape
 * @returns True, if the new shape overlaps the existing shape. Else, false
 */
export function shapesOverlap(
    newShape: Rectangle | Ellipse,
    existingShape: Rectangle | Ellipse
): boolean {
    if (newShape instanceof Rectangle) {
        if (existingShape instanceof Rectangle) {
            //For rectangle-rectangle, check if their edges intersect
            return edgesWithin(newShape, existingShape);
        } else {
            return ellipseRectangleCollision(existingShape as Ellipse, newShape as Rectangle);
        }
    } else {
        if (existingShape instanceof Rectangle) {
            return ellipseRectangleCollision(newShape as Ellipse, existingShape as Rectangle);
        } else {
            //For ellipse-ellipse collision, check if the rectangular bounding boxes intersect.
            //If they do, check if points of the new ellipse are within the current ellipse
            if (
                shapesOverlap(
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
                const points: Point[] = getEllipsePoints(newShape);
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

function ellipseRectangleCollision(ellipse: Ellipse, rectangle: Rectangle): boolean {
    //For ellipse-rectangle collision, check if points on the ellipse are
    //within the rectangle
    const points: Point[] = getEllipsePoints(ellipse);
    for (let i = 0; i < points.length; i++) {
        if (pointInRect(rectangle, points[i])) {
            return true;
        }
    }
    return false;
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
            const innerCoords: Point[] = getEllipsePoints(innerShape as Ellipse);
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
 * Method that checks if any edges of a rectangle are within the other rectangle.
 * @param rect1 The incoming rectangle.
 * @param rect2 The existing rectangle.
 * @returns True, if edges overlap. Else, false.
 */
function edgesWithin(rect1: Rectangle, rect2: Rectangle): boolean {
    const corners1 = rect1.getCorners();
    const corners2 = rect2.getCorners();

    //2 equal edges (aka edges on edges) are considered as intersection
    return (
        //Check if the horizontal edges are within
        ((corners1[0].y <= corners2[0].y && corners1[2].y >= corners2[0].y) ||
            (corners1[0].y <= corners2[2].y && corners1[2].y >= corners2[2].y) ||
            (corners2[0].y <= corners1[0].y && corners2[2].y >= corners1[0].y) ||
            (corners2[0].y <= corners1[2].y && corners2[2].y >= corners1[2].y)) &&
        //Check if the vertical edges are within
        ((corners1[0].x <= corners2[0].x && corners1[1].x >= corners2[0].x) ||
            (corners1[0].x <= corners2[1].x && corners1[1].x >= corners2[1].x) ||
            (corners2[0].x <= corners1[0].x && corners2[1].x >= corners1[0].x) ||
            (corners2[0].x <= corners1[1].x && corners2[1].x >= corners1[1].x))
    );
}

/**
 * Method that checks whether there is a point inside the given rectangle.
 * @param rect The given rectangle.
 * @param otherPoint The point that might be inside the given rectangle.
 * @returns True, if the point is completely inside the rectangle. Else, false.
 */
export function pointInRect(rect: Rectangle, point: Point): boolean {
    const rectCorners = rect.getCorners();

    //Points on edges are considered to be contained
    return (
        rectCorners[0].x <= point.x &&
        rectCorners[1].x >= point.x &&
        rectCorners[0].y <= point.y &&
        rectCorners[2].y >= point.y
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

    //Points on edges are considered to be contained
    const p: number =
        Math.pow(point.x - ellipse.center.x, 2) / Math.pow(ellipse.radiusX, 2) +
        Math.pow(point.y - ellipse.center.y, 2) / Math.pow(ellipse.radiusY, 2);

    return p <= 1;
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
export function getEllipsePoints(ellipse: Ellipse): Point[] {
    const points: Point[] = [];
    let x: number;
    let y: number;
    let curve = 1;

    for (let i = 0; i < 360; i++) {
        x = ellipse.center.x + ellipse.radiusX * Math.cos(i * (Math.PI / 180));
        if (i > 180) {
            curve = -1;
        }
        y = getCurvePoint(ellipse, x, curve);

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
