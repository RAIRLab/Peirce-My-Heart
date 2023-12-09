/**
 * File containing cut based event functions.
 * @author Dawn Moore
 * @author James Oswald
 */

import {Point} from "../AEG/Point";
import {CutNode} from "../AEG/CutNode";
import {Ellipse} from "../AEG/Ellipse";
import {treeContext} from "../treeContext";
import {offset} from "../SharedToolUtils/DragTool";
import {legalColor, illegalColor} from "../Themes";
import {drawCut, redrawTree, drawGuidelines} from "../SharedToolUtils/DrawUtils";
import {createEllipse, ellipseLargeEnough} from "../SharedToolUtils/EditModeUtils";

const showRectElm: HTMLInputElement = <HTMLInputElement>document.getElementById("showRect");

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
    redrawTree(treeContext.tree);
    newCut.ellipse = createEllipse(startingPoint, currentPoint);

    if (!wasOut) {
        const legal = treeContext.tree.canInsert(newCut) && ellipseLargeEnough(newCut.ellipse);
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
    if (
        treeContext.tree.canInsert(newCut) &&
        !wasOut &&
        ellipseLargeEnough(<Ellipse>newCut.ellipse)
    ) {
        treeContext.tree.insert(newCut);
    }
    redrawTree(treeContext.tree);
}

/**
 * Resets the canvas if the mouse ends up out of the canvas.
 */
export function cutMouseOut() {
    wasOut = true;
    redrawTree(treeContext.tree);
}
