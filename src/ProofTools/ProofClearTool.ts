/**
 * @file Contains methods for clearing the Proof Mode HTML canvas.
 *
 * @author Anusha Tiwari
 */

import {AEGTree} from "../AEG/AEGTree";
import {cleanCanvas, highlightNode, redrawProof} from "../SharedToolUtils/DrawUtils";
import {deleteButtons} from "../ProofHistory/ProofHistory";
import {getCurrentProofTree} from "./ProofToolUtils";
import {illegalColor} from "../Themes";
import {TreeContext} from "../TreeContext";

//Current tree in the proof chain.
let currentProofTree: AEGTree;

//True if currentProofTree can be cleared (i.e within the canvas).
let legalNode: boolean;

/**
 * Clears the canvas and highlights all nodes on it as the illegal color.
 */
export function proofClearMouseDown(): void {
    currentProofTree = getCurrentProofTree();
    legalNode = true;
    cleanCanvas();
    highlightNode(currentProofTree.sheet, illegalColor());
}

/**
 * Clears the proofs history's buttons and redraws the proof.
 */
export function proofClearMouseUp(): void {
    if (legalNode) {
        deleteButtons(-1);
        TreeContext.clearProof();
        redrawProof();
    }
}

/**
 * Redraws the proof.
 */
export function proofClearMouseOut(): void {
    legalNode = false;
    redrawProof();
}
