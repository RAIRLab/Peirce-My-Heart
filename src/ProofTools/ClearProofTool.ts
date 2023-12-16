import {AEGTree} from "../AEG/AEGTree";
import {cleanCanvas, highlightNode, redrawProof} from "../SharedToolUtils/DrawUtils";
import {deleteButtons} from "../ProofHistory";
import {getCurrentProofTree} from "./ProofToolsUtils";
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
 * Gets the AEGTree of the current proof step.
 * Then clears the canvas and highlights all nodes on it as the illegal color.
 */
export function clearProofMouseDown() {
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
export function clearProofMouseUp() {
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
export function clearProofMouseOut() {
    legalNode = false;
    redrawProof();
}
