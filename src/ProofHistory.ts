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

    //Create the new button with the function stepBack calling the step it represents
    const button = document.createElement("button");
    button.type = "button";
    button.id = "Step: " + treeContext.proof.length;
    button.className = "proofNodeButton";
    button.title = newStep.tree.toString();
    button.onclick = function () {
        stepBack(newStep);
    };

    //Determine which action was just taken to give the button the corresponding icon.
    const icon = document.createElement("Text");
    switch (newStep.appliedRule) {
        case "Single Move":
            icon.className = "fa fa-mouse-pointer";
            break;
        case "Multi Move":
            icon.className = "fa fa-arrows";
            break;
        case "Resize":
            icon.className = "fa fa-arrows-alt";
            break;
        case "DC Insert":
            icon.className = "fa fa-dot-circle-o";
            break;
        case "DC Delete":
            icon.className = "fa fa-times-circle";
            break;
        case "Insertion":
            icon.className = "fa fa-plus";
            break;
        case "Erasure":
            icon.className = "fa fa-trash";
            break;
        case "Iteration":
            icon.className = "fa fa-expand";
            break;
        case "Deiteration":
            icon.className = "fa fa-compress";
            break;
        case "Pasted":
            icon.className = "fa fa-files-o";
            break;
    }

    button.appendChild(icon);
    newDiv.appendChild(button);
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
