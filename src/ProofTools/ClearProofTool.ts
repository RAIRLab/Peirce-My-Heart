import {AEGTree} from "../AEG/AEGTree";
import {cleanCanvas, highlightNode, redrawProof} from "../SharedToolUtils/DrawUtils";
import {deleteButtons} from "../ProofHistory";
import {getCurrentProofTree} from "./ProofToolsUtils";
import {illegalColor} from "../Themes";
import {treeContext} from "../treeContext";

/**
 * File containing clear proof tool event handlers
 * @author Anusha Tiwari
 */

//The current tree in the proof chain
let currentProofTree: AEGTree;

//Whether or not the node can be cleared
let legalNode: boolean;

/**
 * Handles the mouseDown event for clearProofTool
 * Gets the tree of the current step and highlights it in the illegal color
 */
export function clearProofMouseDown() {
    //Get the tree of the current step
    currentProofTree = getCurrentProofTree();

    //As long as we are within the canvas, we can legally perform clear
    legalNode = true;
    //Clear the canvas and redraw the tree in illegal color to show that it will be deleted
    cleanCanvas();
    highlightNode(currentProofTree.sheet, illegalColor());
}

/**
 * Handles the mouseOut event for clearProofTool
 * If we are within the canvas, delete the proof history buttons and clear the proof
 */
export function clearProofMouseUp() {
    if (legalNode) {
        deleteButtons(-1);
        treeContext.clearProof();
        redrawProof();
    }
}

/**
 * Handles the mouseOut event for clearProofTool
 * If we move out of the canvas, the proof cannot be cleared
 */
export function clearProofMouseOut() {
    legalNode = false;
    redrawProof();
}
