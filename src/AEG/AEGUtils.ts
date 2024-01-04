/**
 * @file Collection of methods used by shapes drawn and stored by the AEGTree.
 * @author Anusha Tiwari
 */

import {Ellipse} from "./Ellipse";
import {Point} from "./Point";
import {Rectangle} from "./Rectangle";

/**
 * Checks whether one incoming shape overlaps another incoming shape.
 *
 * Decomposes overlapping into an intersection check and a contains check.
 * If either of these checks return true, i.e the shapes intersect or contain each other or both,
 * The shapes overlap.
 *
 * @param newShape One incoming shape.
 * @param existingShape Another incoming shape.
 * @returns True, if newShape overlaps existingShape.
 */
export function shapesOverlap(
    newShape: Rectangle | Ellipse,
    existingShape: Rectangle | Ellipse
): boolean {
    return shapesIntersect(newShape, existingShape) || shapeContains(existingShape, newShape);
}

/**
 * Checks whether one incoming shape intersects another incoming shape.
 *
 * @param newShape One incoming shape.
 * @param existingShape Another incoming shape.
 * @returns True, if newShape intersects existingShape.
 */
export function shapesIntersect(
    newShape: Rectangle | Ellipse,
    existingShape: Rectangle | Ellipse
): boolean {
    if (newShape instanceof Rectangle) {
        if (existingShape instanceof Rectangle) {
            return edgesIntersect(newShape as Rectangle, existingShape as Rectangle);
        } else {
            return ellipseRectangleIntersection(existingShape as Ellipse, newShape as Rectangle);
        }
    } else {
        if (existingShape instanceof Rectangle) {
            return ellipseRectangleIntersection(newShape as Ellipse, existingShape as Rectangle);
        } else {
            //For Ellipse-Ellipse collision checking, determine if their Rectangle bounding boxes intersect or contain one another.
            //If they do, check if points of the new Ellipse are within the current Ellipse.
            if (
                edgesIntersect(
                    (newShape as Ellipse).boundingBox,
                    (existingShape as Ellipse).boundingBox
                ) ||
                shapeContains(
                    (existingShape as Ellipse).boundingBox,
                    (newShape as Ellipse).boundingBox
                )
            ) {
                const points: Point[] = getEllipsePoints(newShape);
                let val: number;
                for (let i = 0; i < points.length; i++) {
                    val = signedDistanceFromEllipse(existingShape as Ellipse, points[i]);
                    if (val <= 0) {
                        //Intersection is true if the point is within the Ellipse OR on the Ellipse.
                        return true;
                    }
                }
                return false;
            }
            return false;
        }
    }
}

/**
 * Checks if there is intersection between an incoming Ellipse and an incoming Rectangle.
 * This includes checks for both vertical and horizontal intersection within the boundaries of the shapes.
 *
 * @param ellipse Incoming Ellipse.
 * @param rectangle Incoming Rectangle.
 * @returns True, if either vertical or horizontal intersection is present.
 */
function ellipseRectangleIntersection(ellipse: Ellipse, rectangle: Rectangle): boolean {
    //For Ellipse-Rectangle collision checking,
    //Determine if there is intersection along the horizontal or vertical edges.
    const corners = rectangle.getCorners();

    //Get curve points to check for vertical edge intersection.
    const leftEdgeUpperCurve = getCurvePoint(ellipse, corners[0].x, 1);
    const rightEdgeUpperCurve = getCurvePoint(ellipse, corners[1].x, 1);
    const leftEdgeLowerCurve = getCurvePoint(ellipse, corners[0].x, -1);
    const rightEdgeLowerCurve = getCurvePoint(ellipse, corners[1].x, -1);

    if (
        (corners[0].y < leftEdgeUpperCurve && leftEdgeUpperCurve < corners[2].y) ||
        (corners[0].y < leftEdgeLowerCurve && leftEdgeLowerCurve < corners[2].y) ||
        (corners[0].y < rightEdgeUpperCurve && rightEdgeUpperCurve < corners[2].y) ||
        (corners[0].y < rightEdgeLowerCurve && rightEdgeLowerCurve < corners[2].y)
    ) {
        return true;
    }

    //Check for horizontal edge intersection.
    const a = -1 / Math.pow(ellipse.radiusX, 2);
    const b = (2 * ellipse.center.x) / Math.pow(ellipse.radiusX, 2);

    //c with height of the top edge.
    const cTop =
        -Math.pow(ellipse.center.x, 2) / Math.pow(ellipse.radiusX, 2) +
        1 -
        Math.pow((corners[0].y - ellipse.center.y) / ellipse.radiusY, 2);

    //c with height of the bottom edge.
    const cBottom =
        -Math.pow(ellipse.center.x, 2) / Math.pow(ellipse.radiusX, 2) +
        1 -
        Math.pow((corners[2].y - ellipse.center.y) / ellipse.radiusY, 2);

    const topX1 = (-b + Math.sqrt(Math.pow(b, 2) - 4 * a * cTop)) / (2 * a);
    const topX2 = (-b - Math.sqrt(Math.pow(b, 2) - 4 * a * cTop)) / (2 * a);
    const bottomX1 = (-b + Math.sqrt(Math.pow(b, 2) - 4 * a * cBottom)) / (2 * a);
    const bottomX2 = (-b - Math.sqrt(Math.pow(b, 2) - 4 * a * cBottom)) / (2 * a);

    //Horizontal intersection is true if the intersection Point is within the bounds of the Ellipse.
    return (
        (!isNaN(topX1) && corners[0].x < topX1 && topX1 < corners[1].x) ||
        (!isNaN(topX2) && corners[0].x < topX2 && topX2 < corners[1].x) ||
        (!isNaN(bottomX1) && corners[0].x < bottomX1 && bottomX1 < corners[1].x) ||
        (!isNaN(bottomX2) && corners[0].x < bottomX2 && bottomX2 < corners[1].x)
    );
}

/**
 * Checks whether an incoming inner shape is contained within an incoming outer shape.
 *
 * A shape is considered to be contained if and only if it is entirely within the other shape.
 * Overlapping edges do not constitute containment.
 *
 * @param outerShape Incoming outer shape.
 * @param innerShape Incoming inner shape.
 *
 * @return True, if outerShape contains innerShape.
 */
export function shapeContains(
    outerShape: Rectangle | Ellipse,
    innerShape: Rectangle | Ellipse
): boolean {
    if (outerShape instanceof Rectangle) {
        if (innerShape instanceof Rectangle) {
            //A Rectangle contains another Rectangle if all the corners, as Points, of the inner Rectangle are
            //Contained within the outer Rectangle.
            const innerCorners: Point[] = (innerShape as Rectangle).getCorners();
            for (let i = 0; i < 4; i++) {
                if (!pointInRect(outerShape as Rectangle, innerCorners[i])) {
                    return false;
                }
            }
            return true;
        } else {
            //A Rectangle contains an Ellipse if all the farthest coordinates of that Ellipse are
            //Contained within the Rectangle.
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
            //An Ellipse contains a Rectangle if all the corners of that Rectangle are
            //Contained within the Ellipse.
            const innerCorners = (innerShape as Rectangle).getCorners();
            let val: number;
            for (let i = 0; i < 4; i++) {
                val = signedDistanceFromEllipse(outerShape as Ellipse, innerCorners[i]);
                if (!(val < 0)) {
                    return false;
                }
            }
            return true;
        } else {
            //An Ellipse contains another Ellipse if all the farthest coordinates of the inner Ellipse are
            //Contained within the outer Ellipse.
            const innerCoords: Point[] = getEllipsePoints(innerShape as Ellipse);
            let val: number;
            for (let i = 0; i < innerCoords.length; i++) {
                val = signedDistanceFromEllipse(outerShape as Ellipse, innerCoords[i]);
                if (!(val < 0)) {
                    return false;
                }
            }
            return true;
        }
    }
}

/**
 * Checks if any edges of one incoming Rectangle intersect with another incoming Rectangle.
 *
 * @param rect1 One incoming Rectangle.
 * @param rect2 Another incoming Rectangle.
 * @returns True, if the edges of rect1 intersect the edges of rect2.
 */
function edgesIntersect(rect1: Rectangle, rect2: Rectangle): boolean {
    const corners1 = rect1.getCorners();
    const corners2 = rect2.getCorners();

    //Edges on other edges are considered intersections. Hence the >= and <=, not > and <.
    return (
        //Horizontal edge intersection checks.
        ((corners1[0].y <= corners2[0].y && corners1[2].y >= corners2[0].y) ||
            (corners1[0].y <= corners2[2].y && corners1[2].y >= corners2[2].y) ||
            (corners2[0].y <= corners1[0].y && corners2[2].y >= corners1[0].y) ||
            (corners2[0].y <= corners1[2].y && corners2[2].y >= corners1[2].y)) &&
        //Vertical edge intersection checks.
        ((corners1[0].x <= corners2[0].x && corners1[1].x >= corners2[0].x) ||
            (corners1[0].x <= corners2[1].x && corners1[1].x >= corners2[1].x) ||
            (corners2[0].x <= corners1[0].x && corners2[1].x >= corners1[0].x) ||
            (corners2[0].x <= corners1[1].x && corners2[1].x >= corners1[1].x))
    );
}

/**
 * Checks whether the incoming Point is inside the incoming Rectangle.
 *
 * @param rect Incoming Rectangle.
 * @param otherPoint Incoming Point.
 * @returns True, if otherPoint is contained within rect.
 */
export function pointInRect(rect: Rectangle, point: Point): boolean {
    const rectCorners = rect.getCorners();

    //Points on edges are considered as intersecting, not contained.
    return (
        rectCorners[0].x < point.x &&
        rectCorners[1].x > point.x &&
        rectCorners[0].y < point.y &&
        rectCorners[2].y > point.y
    );
}

/**
 * Calculates and returns the signed distance of the incoming Point with respect to the incoming Ellipse.
 *
 * @param ellipse Incoming Ellipse.
 * @param otherPoint Incoming Point.
 *
 * @returns 0, if point is on ellipse.
 * @returns < 0 if point is completely within ellipse.
 * @returns > 0 if point is completely outside ellipse.
 */
export function signedDistanceFromEllipse(ellipse: Ellipse, point: Point): number {
    //(x-h)^2/rx^2 + (y-k)^2/ry^2 <= 1
    //(x, y) = new point
    //(h, k) = center

    //Points on edges are considered as contained.
    const p: number =
        Math.pow(point.x - ellipse.center.x, 2) / Math.pow(ellipse.radiusX, 2) +
        Math.pow(point.y - ellipse.center.y, 2) / Math.pow(ellipse.radiusY, 2);

    return p - 1;
}

/**
 * Creates and returns an array, of length 4,
 * Containing the farthest Points of the incoming Ellipse, i.e. the farthest Points on the
 * x-axis and y-axis of the Ellipse.
 *
 * @param ellipse Incoming Ellipse.
 * @returns Farthest Points of ellipse.
 *
 * The Points are in clockwise order such that:
 * 0 - Topmost Point (Top along y-axis).
 * 1 - Rightmost Point (Right along x-axis).
 * 2 - Bottommost Point (Bottom along y-axis).
 * 3 - Leftmost Point (Left along x-axis).
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
 * Calculates and returns the Points along the boundary of the incoming Ellipse.
 *
 * @param ellipse Incoming Ellipse.
 * @returns Points along the boundary of ellipse.
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
 * Calculates and returns the y-coordinate of a Point on the curve of the incoming Ellipse for the
 * Incoming x-coordinate and half of the curve.
 *
 * @param ellipse Incoming Ellipse.
 * @param x Incoming x-coordinate.
 * @param curveHalf Represents which half of the Ellipse currently being worked with.
 * 1 for top curve, -1 for bottom curve.
 * @returns y-coordinate of the Point with x along curveHalf.
 */
function getCurvePoint(ellipse: Ellipse, x: number, curveHalf: number): number {
    if (ellipse.radiusX === 0 || ellipse.radiusY === 0) {
        return ellipse.center.y;
    }
    return (
        curveHalf *
            ellipse.radiusY *
            Math.sqrt(1 - Math.pow((x - ellipse.center.x) / ellipse.radiusX, 2)) +
        ellipse.center.y
    );
}
