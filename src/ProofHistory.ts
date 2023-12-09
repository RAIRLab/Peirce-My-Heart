/**
 * Creates the history bar on the left side of the screen and handles returning to a previous state.
 * @author Dawn Moore
 */

import {treeContext} from "./treeContext";
import {redrawProof} from "./SharedToolUtils/DrawUtils";
import {ProofNode} from "./AEG/ProofNode";

/**
 * Creates a button representing the proof step allowing a user to return to that step.
 * Creates a new row, a piece of text, and a button for it.
 * @param newStep The newest step of our proof
 * @param step The number of the step that we are appending
 */
export function appendStep(newStep: ProofNode, step?: number) {
    const newDiv = document.createElement("div");
    newDiv.className = "row";
    const stepNumber = step ? step : treeContext.proof.length;
    newDiv.id = "Row: " + stepNumber;

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
    icon.className =
        "fa fa-" +
        {
            "Single Move": "mouse-pointer",
            "Multi Move": "arrows",
            Resize: "arrows-alt",
            "DC Insert": "dot-circle-o",
            "DC Delete": "times-circle",
            Insertion: "plus",
            Erasure: "trash",
            Iteration: "expand",
            Deiteration: "compress",
            Pasted: "files-o",
        }[newStep.appliedRule];

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
