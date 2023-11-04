/**
 * File containing cut based event functions.
 * @author Dawn Moore
 * @author James Oswald
 */

import {Point} from "../AEG/Point";
import {CutNode} from "../AEG/CutNode";
import {Ellipse} from "../AEG/Ellipse";
import {tree} from "../index";
import {offset} from "./DragMode";
import {legalColor, illegalColor} from "../Themes";
import {drawCut, redrawTree, drawGuidelines} from "./DrawUtils";

const showRectElm: HTMLInputElement = <HTMLInputElement>document.getElementById("showRect");
const modeElm: HTMLSelectElement = <HTMLSelectElement>document.getElementById("mode");

//The point the ellipse is initially placed.
let startingPoint: Point;

//Tracks if the mouse has ever left canvas disallowing future movements.
let wasOut: boolean;

/**
 * Sets the starting point for the ellipse to where the user clicks.
 * @param event The mouse down event
 */
export function cutMouseDown(event: MouseEvent) {
    startingPoint = new Point(event.clientX - offset.x, event.clientY - offset.y);
    wasOut = false;
}

/**
 * Takes the current point of the ellipse and draws the ellipse between those two points.
 * Checks to see if the current point is valid to determine color.
 * Redraws the canvas then draws the ellipse.
 * @param event The mouse move event
 */
export function cutMouseMove(event: MouseEvent) {
    const newCut: CutNode = new CutNode(new Ellipse(new Point(0, 0), 0, 0));
    const currentPoint: Point = new Point(event.clientX - offset.x, event.clientY - offset.y);
    redrawTree(tree);
    newCut.ellipse = createEllipse(startingPoint, currentPoint);

    if (!wasOut) {
        const legal = tree.canInsert(newCut) && ellipseLargeEnough(newCut.ellipse);
        const color = legal ? legalColor() : illegalColor();
        drawCut(newCut, color);

        if (showRectElm.checked) {
            drawGuidelines(startingPoint, currentPoint, color);
        }
    }
}

/**
 * Takes the current point of the mouse up event and if it is in a legal position adds it to the tree
 * Redraws the canvas, if the cut was legal it will be there on the new redraw.
 * @param event The mouse up event
 */
export function cutMouseUp(event: MouseEvent) {
    const currentPoint: Point = new Point(event.clientX - offset.x, event.clientY - offset.y);
    const newCut: CutNode = new CutNode(createEllipse(startingPoint, currentPoint));
    if (tree.canInsert(newCut) && !wasOut && ellipseLargeEnough(<Ellipse>newCut.ellipse)) {
        tree.insert(newCut);
    }
    redrawTree(tree);
}

/**
 * Resets the canvas if the mouse ends up out of the canvas.
 */
export function cutMouseOut() {
    wasOut = true;
    redrawTree(tree);
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

    return new Ellipse(center, rx, ry);
}

/**
 * Checks to see if the given ellipse is large enough to be considered legal.
 * @param ellipse The ellipse to be checked
 * @returns Whether the given ellipse is large enough to be legal
 */
export function ellipseLargeEnough(ellipse: Ellipse) {
    if (ellipse.radiusX > 15 && ellipse.radiusY > 15) {
        return true;
    }
    return false;
}
