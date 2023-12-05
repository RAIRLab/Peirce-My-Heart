/**
 * Creates the history bar on the left side of the screen and handles returning to a previous state.
 * @author Dawn Moore
 */

import {treeContext} from "./treeContext";
import {redrawProof} from "./DrawModes/DrawUtils";
import {ProofNode} from "./AEG/ProofNode";

/**
 * Creates a button representing the proof step allowing a user to return to that step.
 * Creates a new row, a piece of text, and a button for it.
 * @param newStep The newest step of our proof
 */
export function appendStep(newStep: ProofNode) {
    const newDiv = document.createElement("div");
    newDiv.className = "row";
    newDiv.id = "Row: " + treeContext.proof.length;

    const button = document.createElement("button");
    button.type = "button";
    button.id = "Step: " + treeContext.proof.length;
    button.className = "proofNodeButton";
    button.title = newStep.tree.toString();
    button.onclick = function () {
        stepBack(newStep);
    };

    const stepContainer = document.createElement("span");
    stepContainer.id = "proofNodeText";
    const stepType = document.createTextNode(newStep.appliedRule);
    stepContainer.appendChild(stepType);

    newDiv.appendChild(button);
    newDiv.appendChild(stepContainer);
    document.getElementById("proofHistoryBar")?.appendChild(newDiv);
}

/**
 * Sets the selected step to be the current step and redraws the canvas to represent this.
 * This will be called when a button representing a proof step is pushed.
 * @param selectedStep The selected proof Node that will become the current step
 */
export function stepBack(selectedStep: ProofNode) {
    treeContext.currentProofStep = selectedStep;
    redrawProof();
}

/**
 * Removes buttons related to proof steps that are no longer a part of the proof.
 * @param stopIndex The index to stop removing buttons.
 */
export function deleteButtons(stopIndex: number) {
    for (let i = treeContext.proof.length; i > stopIndex + 1; i--) {
        document.getElementById("Row: " + i)?.remove();
    }
}
