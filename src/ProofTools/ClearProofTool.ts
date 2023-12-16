import {AEGTree} from "../AEG/AEGTree";
import {cleanCanvas, highlightNode, redrawProof} from "../SharedToolUtils/DrawUtils";
import {deleteButtons} from "../ProofHistory";
import {getCurrentProofTree} from "./ProofToolUtils";
import {illegalColor} from "../Themes";
import {treeContext} from "../treeContext";

/**
 * Contains methods for clearing the Proof Mode HTML canvas.
 *
 * @author Anusha Tiwari
 */

//Current tree in the proof chain.
let currentProofTree: AEGTree;

//True if currentProofTree can be cleared (i.e within the canvas).
let legalNode: boolean;

/**
 * Sets currentProofTree to the AEGTree of the current proof step.
 * Then clears the canvas and highlights all nodes on it as the illegal color.
 */
export function clearProofMouseDown(): void {
    currentProofTree = getCurrentProofTree();
    legalNode = true;
    cleanCanvas();
    highlightNode(currentProofTree.sheet, illegalColor());
}

/**
 * Clears the proof's history buttons.
 * Then clears the proof.
 * Then redraws the proof.
 */
export function clearProofMouseUp(): void {
    if (legalNode) {
        deleteButtons(-1);
        treeContext.clearProof();
        redrawProof();
    }
}

/**
 * Sets legality to false.
 * Then redraws the proof.
 */
export function clearProofMouseOut(): void {
    legalNode = false;
    redrawProof();
}
