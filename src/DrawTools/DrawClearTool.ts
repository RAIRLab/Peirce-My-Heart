/**
 * @file Clears the draw mode canvas on click.
 *
 * @author James Oswald
 */

import {AEGTree} from "../AEG/AEGTree";
import {cleanCanvas, highlightNode, redrawTree} from "../SharedToolUtils/DrawUtils";
import {DrawModeMove} from "../DrawHistory/DrawModeNode";
import {illegalColor} from "../Themes";
import {TreeContext} from "../TreeContext";

//True if currentProofTree can be cleared (i.e within the canvas).
let legalNode: boolean;

/**
 * Clears the canvas and highlights all nodes on it as the illegal color.
 */
export function drawClearMouseDown(): void {
    legalNode = true;
    cleanCanvas();
    highlightNode(TreeContext.tree.sheet, illegalColor());
}

/**
 * Clears the proofs history's buttons and redraws the proof.
 */
export function drawClearMouseUp(): void {
    if (legalNode) {
        TreeContext.tree = new AEGTree();
        redrawTree(TreeContext.tree);
        TreeContext.pushToDrawStack(DrawModeMove.CLEAR);
    }
}

/**
 * Redraws the proof.
 */
export function drawClearMouseOut(): void {
    legalNode = false;
    redrawTree(TreeContext.tree);
}
