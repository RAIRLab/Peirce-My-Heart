/**
 * File containing double cut based events
 * @author Dawn Moore
 * @author James Oswald
 */

import {Point} from "../AEG/Point";
import {CutNode} from "../AEG/CutNode";
import {changeCursorStyle, determineAndChangeCursorStyle} from "../SharedToolUtils/DrawUtils";
import {Ellipse} from "../AEG/Ellipse";
import {treeContext} from "../treeContext";
import {offset} from "../SharedToolUtils/DragTool";
import {legalColor, illegalColor} from "../Themes";
import {drawCut, redrawProof, drawGuidelines} from "../SharedToolUtils/DrawUtils";
import {ProofNode} from "../AEG/ProofNode";
import {AEGTree} from "../AEG/AEGTree";
import {getCurrentProofTree} from "./ProofToolsUtils";
import {createEllipse, ellipseLargeEnough} from "../SharedToolUtils/EditModeUtils";

const showRectElm: HTMLInputElement = <HTMLInputElement>document.getElementById("showRect");

//The point the ellipse is initially placed.
let startingPoint: Point;

//Tracks if the mouse has ever left canvas disallowing future movements.
let wasOut: boolean;

let currentProofTree: AEGTree;

/**
 * Sets the canvas' style attribute to crosshair.
 */
export function doubleCutInsertionMouseEnter() {
    changeCursorStyle("cursor: crosshair");
}

/**
 * Records the current point on the canvas.
 * @param event The double cut event while using the double cut insertion tool
 */
export function doubleCutInsertionMouseDown(event: MouseEvent) {
    startingPoint = new Point(event.clientX - offset.x, event.clientY - offset.y);
    currentProofTree = getCurrentProofTree();
    wasOut = false;
}

/**
 * Takes the current location of the mouse and creates a cut based on those points.
 * Creates a smaller ellipse that will also be inserted.
 * If either of them are illegal draws both of them as illegal.
 * @param event The mouse move event while using double cut insertion tool
 */
export function doubleCutInsertionMouseMove(event: MouseEvent) {
    const currentPoint: Point = new Point(event.clientX - offset.x, event.clientY - offset.y);
    const largeCut: CutNode = new CutNode(createEllipse(startingPoint, currentPoint));
    const smallCut: CutNode = new CutNode(calcSmallEllipse(<Ellipse>largeCut.ellipse));
    redrawProof();

    if (!wasOut && largeCut.ellipse !== null && smallCut.ellipse !== null) {
        //If either ellipse is in an invalid position or too small it cannot be inserted
        const legal =
            currentProofTree.canInsert(largeCut) &&
            ellipseLargeEnough(largeCut.ellipse) &&
            currentProofTree.canInsert(smallCut) &&
            ellipseLargeEnough(smallCut.ellipse);

        const color = legal ? legalColor() : illegalColor();
        determineAndChangeCursorStyle(color, "cursor: crosshair", "cursor: no-drop");
        drawCut(largeCut, color);
        drawCut(smallCut, color);

        if (showRectElm.checked) {
            drawGuidelines(startingPoint, currentPoint, color);
        }
    }
}

/**
 * Takes the current location of the mouse and creates a cut based on those points.
 * Creates a smaller ellipse that will also be inserted.
 * If either of the cuts are illegal inserts neither of them.
 * @param event The mouse up event while using double cut insertion tool
 */
export function doubleCutInsertionMouseUp(event: MouseEvent) {
    changeCursorStyle("cursor: crosshair");
    const currentPoint: Point = new Point(event.clientX - offset.x, event.clientY - offset.y);
    currentProofTree = getCurrentProofTree();

    const largeCut: CutNode = new CutNode(createEllipse(startingPoint, currentPoint));
    const smallCut: CutNode = new CutNode(calcSmallEllipse(<Ellipse>largeCut.ellipse));

    //Stores the tree of the previous proof so that we can perform double cut actions without
    //altering that tree
    const nextProof = new ProofNode(currentProofTree, "DC Insert");

    if (!wasOut && largeCut.ellipse !== null && smallCut.ellipse !== null) {
        //If either ellipse is in an invalid position or too small it cannot be inserted
        const legal =
            currentProofTree.canInsert(largeCut) &&
            ellipseLargeEnough(largeCut.ellipse) &&
            currentProofTree.canInsert(smallCut) &&
            ellipseLargeEnough(smallCut.ellipse);

        if (legal) {
            nextProof.tree.insert(largeCut);
            nextProof.tree.insert(smallCut);
            treeContext.pushToProof(nextProof);
        }
    }
    redrawProof();
}

/**
 * Resets the canvas if the mouse ends up out of the canvas.
 */
export function doubleCutInsertionMouseOut() {
    changeCursorStyle("cursor: default");
    wasOut = true;
    redrawProof();
}

/**
 * Creates a new smaller ellipse with 80% of the radius of the original.
 * @param ellipse The original larger ellipse
 * @returns The new smaller ellipse
 */
function calcSmallEllipse(ellipse: Ellipse): Ellipse {
    return new Ellipse(
        ellipse.center,
        Math.floor(ellipse.radiusX * 0.8),
        Math.floor(ellipse.radiusY * 0.8)
    );
}
