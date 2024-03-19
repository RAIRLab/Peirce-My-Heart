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
import {ProofModeMove} from "../ProofHistory/ProofModeMove";
import {ProofModeNode} from "../ProofHistory/ProofModeNode";
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

    if (!wasOut) {
        const color = selectAndHighlightHandler(largeCut, smallCut) ? legalColor() : illegalColor();
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

    const nextProof = new ProofModeNode(currentProofTree, ProofModeMove.DC_INSERT);

    if (!wasOut && selectAndHighlightHandler(largeCut, smallCut)) {
        nextProof.tree.insert(largeCut);
        nextProof.tree.insert(smallCut);
        TreeContext.pushToProof(nextProof);
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

/**
 * Determines if the two cuts are both in legal positions, are considered larger enough to be legal
 * and ensures the larger cut will not have any children except the smaller cut.
 * @param largeCut The outer cut of the double cut being drawn
 * @param smallCut The inner cut of the double cut being drawn
 * @returns If the current double cut is in a valid position for placement
 */
function selectAndHighlightHandler(largeCut: CutNode, smallCut: CutNode): boolean {
    return (
        largeCut.ellipse !== null &&
        smallCut.ellipse !== null &&
        currentProofTree.canInsert(largeCut) &&
        ellipseLargeEnough(largeCut.ellipse) &&
        currentProofTree.canInsert(smallCut) &&
        ellipseLargeEnough(smallCut.ellipse) &&
        largeCutChildrenCheck(largeCut, smallCut)
    );
}

/**
 * Creates a copy of the current tree, and the current cuts and inserts them into the copied tree.
 * If the inserted larger cut has any children besides the inner cut then it is not a valid double cut
 * and returns false.
 * @param largeCut The outer cut of the double cut being drawn
 * @param smallCut The inner cut of the double cut being drawn
 * @returns Whether or not the larger cut will only have the inner cut as a child
 */
function largeCutChildrenCheck(largeCut: CutNode, smallCut: CutNode): boolean {
    const treeCopy: AEGTree = new AEGTree(currentProofTree.sheet);
    const largeCutCopy: CutNode = new CutNode(largeCut.ellipse);
    const smallCutCopy: CutNode = new CutNode(smallCut.ellipse);

    treeCopy.insert(largeCutCopy);
    treeCopy.insert(smallCutCopy);

    return largeCutCopy.children.length === 1;
}
