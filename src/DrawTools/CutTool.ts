/**
 * @file Contains methods for manipulating CutNodes on the HTML canvas.
 *
 * When a CutNode's position is described as being valid or not,
 * this means that we are determining if it can currently be inserted
 * into the AEGTree without intersection.
 *
 * @author Dawn Moore
 * @author James Oswald
 * @author Anusha Tiwari
 */

import {changeCursorStyle, determineAndChangeCursorStyle} from "../SharedToolUtils/DrawUtils";
import {createEllipse, ellipseLargeEnough} from "../SharedToolUtils/EditModeUtils";
import {CutNode} from "../AEG/CutNode";
import {drawCut, drawGuidelines, redrawTree} from "../SharedToolUtils/DrawUtils";
import {DrawModeMove} from "../DrawHistory/DrawModeNode";
import {Ellipse} from "../AEG/Ellipse";
import {illegalColor, legalColor} from "../Themes";
import {offset} from "../SharedToolUtils/DragTool";
import {Point} from "../AEG/Point";
import {TreeContext} from "../TreeContext";

//Checkbox next to "Show Guidelines:" in Draw Mode' Cut Tool toolbar.
const showRectElm: HTMLInputElement = <HTMLInputElement>document.getElementById("showRect");

//Point the CutNode is initially placed.
let startingPoint: Point;

//True if the mouse has left canvas.
let wasOut: boolean;

/**
 * Sets the canvas' style attribute to crosshair.
 */
export function cutMouseEnter(): void {
    changeCursorStyle("cursor: crosshair");
}

/**
 * Sets startingPoint according to the coordinates given by the incoming MouseEvent.
 *
 * @param event Incoming MouseEvent.
 */
export function cutMouseDown(event: MouseEvent): void {
    startingPoint = new Point(event.clientX - offset.x, event.clientY - offset.y);
    wasOut = false;
}

/**
 * Draws a CutNode on canvas using startingPoint and the coordinates given by the incoming MouseEvent.
 * Then highlights this CutNode according to its position's validity.
 * Highlight Color is legal only if this CutNode's Ellipse can be inserted and is greater than the minimum radii values.
 * Then redraws the canvas and the CutNode regardless of validity.
 * Then redraws the CutNode guidelines if that checkbox is active.
 *
 * @param event Incoming MouseEvent.
 */
export function cutMouseMove(event: MouseEvent): void {
    const newCut: CutNode = new CutNode(new Ellipse(new Point(0, 0), 0, 0));
    const currentPoint: Point = new Point(event.clientX - offset.x, event.clientY - offset.y);
    redrawTree(TreeContext.tree);
    newCut.ellipse = createEllipse(startingPoint, currentPoint);

    if (!wasOut) {
        const legal = TreeContext.tree.canInsert(newCut) && ellipseLargeEnough(newCut.ellipse);
        const color = legal ? legalColor() : illegalColor();

        determineAndChangeCursorStyle(color, "cursor: crosshair", "cursor: no-drop");
        drawCut(newCut, color);

        if (showRectElm.checked) {
            drawGuidelines(startingPoint, currentPoint, color);
        }
    }
}

/**
 * Inserts a CutNode into the Draw Mode AEGTree if its position valid.
 * This CutNode's Ellipse uses the coordinates given by the incoming MouseEvent into its calculation.
 * Then redraws the canvas regardless of this new CutNode's insertion.
 *
 * @param event Incoming MouseEvent.
 */
export function cutMouseUp(event: MouseEvent): void {
    changeCursorStyle("cursor: crosshair");
    const currentPoint: Point = new Point(event.clientX - offset.x, event.clientY - offset.y);
    const newCut: CutNode = new CutNode(createEllipse(startingPoint, currentPoint));
    if (
        TreeContext.tree.canInsert(newCut) &&
        !wasOut &&
        ellipseLargeEnough(<Ellipse>newCut.ellipse)
    ) {
        TreeContext.tree.insert(newCut);
        TreeContext.pushToDrawStack(DrawModeMove.DRAW_CUT);
    }
    redrawTree(TreeContext.tree);
}

/**
 * Sets wasOut to true.
 * Then redraws the Draw Mode AEGTree.
 */
export function cutMouseOut(): void {
    changeCursorStyle("cursor: default");
    wasOut = true;
    redrawTree(TreeContext.tree);
}
