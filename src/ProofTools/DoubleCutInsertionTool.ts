/**
 * @file Contains methods for inserting two CutNodes at once on the Proof Mode HTML canvas.
 *
 * @author Dawn Moore
 * @author James Oswald
 * @author Anusha Tiwari
 */

import {AEGTree} from "../AEG/AEGTree";
import {
    changeCursorStyle,
    determineAndChangeCursorStyle,
    drawCut,
    drawGuidelines,
    redrawProof,
} from "../SharedToolUtils/DrawUtils";
import {createEllipse, ellipseLargeEnough} from "../SharedToolUtils/EditModeUtils";
import {CutNode} from "../AEG/CutNode";
import {Ellipse} from "../AEG/Ellipse";
import {getCurrentProofTree} from "./ProofToolUtils";
import {illegalColor, legalColor} from "../Themes";
import {offset} from "../SharedToolUtils/DragTool";
import {Point} from "../AEG/Point";
import {ProofNode} from "../Proof/ProofNode";
import {TreeContext} from "../TreeContext";

//Checkbox next to "Show Guidelines:" in Proof Mode's Double Cut Insertion tool.
const showRectElm: HTMLInputElement = <HTMLInputElement>document.getElementById("showRect");

//First Point the user clicks.
let startingPoint: Point;

//True if the mouse has left canvas.
let wasOut: boolean;

//AEGTree at the current proof step.
let currentProofTree: AEGTree;

/**
 * Sets cursor style to crosshair.
 */
export function doubleCutInsertionMouseEnter(): void {
    changeCursorStyle("cursor: crosshair");
}

/**
 * Sets startingPoint according to the coordinates given by the incoming MouseEvent.
 *
 * @param event Incoming MouseEvent.
 */
export function doubleCutInsertionMouseDown(event: MouseEvent): void {
    startingPoint = new Point(event.clientX - offset.x, event.clientY - offset.y);
    currentProofTree = getCurrentProofTree();
    wasOut = false;
}

/**
 * Determines the size of the outer CutNode in a double cut according to the coordinates given by
 * the incoming MouseEvent. Same for the inner CutNode.
 *
 * Then if the mouse has not left canvas and neither Ellipse is null,
 *      Checks if both CutNodes are able to be inserted and are larger than the minimum size, and
 *      Highlights both CutNodes as the legal or illegal color.
 *
 * Draws the Ellipses' bounding boxes if that is enabled.
 *
 * @param event Incoming MouseEvent.
 */
export function doubleCutInsertionMouseMove(event: MouseEvent): void {
    const currentPoint: Point = new Point(event.clientX - offset.x, event.clientY - offset.y);
    const largeCut: CutNode = new CutNode(createEllipse(startingPoint, currentPoint));
    const smallCut: CutNode = new CutNode(calcSmallEllipse(<Ellipse>largeCut.ellipse));
    redrawProof();

    if (!wasOut && largeCut.ellipse !== null && smallCut.ellipse !== null) {
        const legal =
            currentProofTree.canInsert(largeCut) &&
            ellipseLargeEnough(largeCut.ellipse) &&
            currentProofTree.canInsert(smallCut) &&
            ellipseLargeEnough(smallCut.ellipse);

        const color = legal ? legalColor() : illegalColor();
        drawCut(largeCut, color);
        drawCut(smallCut, color);
        determineAndChangeCursorStyle(color, "cursor: crosshair", "cursor: no-drop");
        if (showRectElm.checked) {
            drawGuidelines(startingPoint, currentPoint, color);
        }
    }
}

/**
 * Follows the same control flow as doubleCutInsertionMouseMove.
 *
 * Then if both CutNodes can be inserted, inserts them and pushes a Double Cut Insert step to
 * the proof history.
 *
 * Then redraws the proof.
 *
 * @see doubleCutInsertionMouseMove
 * @param event Incoming MouseEvent.
 */
export function doubleCutInsertionMouseUp(event: MouseEvent): void {
    changeCursorStyle("cursor: crosshair");
    const currentPoint: Point = new Point(event.clientX - offset.x, event.clientY - offset.y);
    currentProofTree = getCurrentProofTree();

    const largeCut: CutNode = new CutNode(createEllipse(startingPoint, currentPoint));
    const smallCut: CutNode = new CutNode(calcSmallEllipse(<Ellipse>largeCut.ellipse));

    const nextProof = new ProofNode(currentProofTree, "DC Insert");

    if (!wasOut && largeCut.ellipse !== null && smallCut.ellipse !== null) {
        const legal =
            currentProofTree.canInsert(largeCut) &&
            ellipseLargeEnough(largeCut.ellipse) &&
            currentProofTree.canInsert(smallCut) &&
            ellipseLargeEnough(smallCut.ellipse);

        if (legal) {
            nextProof.tree.insert(largeCut);
            nextProof.tree.insert(smallCut);
            TreeContext.pushToProof(nextProof);
        }
    }
    redrawProof();
}

/**
 * Sets all fields back to default.
 */
export function doubleCutInsertionMouseOut(): void {
    changeCursorStyle("cursor: default");
    wasOut = true;
    redrawProof();
}

/**
 * Creates and returns a new smaller Ellipse with 80% of the radius of the incoming Ellipse.
 *
 * @param ellipse Incoming Ellipse.
 * @returns Smaller Ellipse with radii 80% as large as ellipse.
 */
function calcSmallEllipse(ellipse: Ellipse): Ellipse {
    return new Ellipse(
        ellipse.center,
        Math.floor(ellipse.radiusX * 0.8),
        Math.floor(ellipse.radiusY * 0.8)
    );
}
