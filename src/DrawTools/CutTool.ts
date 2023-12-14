import {createEllipse, ellipseLargeEnough} from "../SharedToolUtils/EditModeUtils";
import {CutNode} from "../AEG/CutNode";
import {drawCut, drawGuidelines, redrawTree} from "../SharedToolUtils/DrawUtils";
import {Ellipse} from "../AEG/Ellipse";
import {illegalColor, legalColor} from "../Themes";
import {offset} from "../SharedToolUtils/DragTool";
import {Point} from "../AEG/Point";
import {treeContext} from "../treeContext";

/**
 * Contains methods for manipulating CutNodes on the HTML canvas.
 *
 * @author Dawn Moore
 * @author James Oswald
 * @author Anusha Tiwari
 */

//Checkbox next to "Show Guidelines:" in Draw Mode' Cut Tool toolbar.
const showRectElm: HTMLInputElement = <HTMLInputElement>document.getElementById("showRect");

//Point the CutNode is initially placed.
let startingPoint: Point;

//True if the mouse has left canvas.
let wasOut: boolean;

/**
 * Sets startingPoint according to the coordinates given by the incoming MouseEvent.
 *
 * @param event Incoming MouseEvent.
 */
export function cutMouseDown(event: MouseEvent) {
    startingPoint = new Point(event.clientX - offset.x, event.clientY - offset.y);
    wasOut = false;
}

/**
 * Draws a CutNode on canvas using startingPoint and the coordinates given by the incoming MouseEvent.
 * Color is legal only if this CutNode's Ellipse calculations can be inserted and are greater than the minimum Ellipse size.
 * Redraws the canvas and CutNode regardless of legality. Also draws the guidelines, if that checkbox is active.
 *
 * @param event Incoming MouseEvent.
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
 * Inserts a CutNode into the Draw Mode AEGTree if possible.
 * This CutNode's Ellipse takes the coordinates given by the incoming MouseEvent into its calculation.
 * Redraws the canvas regardless if the CutNode was inserted.
 *
 * @param event Incoming MouseEvent.
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
 * Marks the mouse as having left canvas and redraws the tree.
 */
export function cutMouseOut() {
    wasOut = true;
    redrawTree(treeContext.tree);
}
