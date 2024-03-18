/**
 * @file Creates the proof history bar on the left side of the screen
 * and handles returning to a previous step.
 *
 * @author Dawn Moore
 */

import {ProofModeMove} from "./ProofModeMove";
import {ProofModeNode} from "./ProofModeNode";
import {redrawProof} from "../SharedToolUtils/DrawUtils";
import {TreeContext} from "../TreeContext";

/**
 * Creates a button representing the incoming ProofNode as a step in the proof history
 * and allows the user to return to that step.
 *
 * @param newStep Incoming ProofNode.
 * @param step Index of newStep in the history.
 */
export function appendStep(newStep: ProofModeNode, step?: number): void {
    const newDiv = document.createElement("div");
    newDiv.className = "row";
    const stepNumber = step ? step : TreeContext.proof.length;
    newDiv.id = "Row: " + stepNumber;

    //Creates the new button.
    //Calls stepBack to send the user back in the proof history by restoring the AEGTree
    //at that step.
    const button = document.createElement("button");
    button.type = "button";
    button.id = "Step: " + TreeContext.proof.length;
    button.className = "proofNodeButton";
    button.title = newStep.tree.toString();
    button.onclick = function () {
        stepBack(newStep);
    };

    //Determines which type of step was taken to give the created button a corresponding icon.
    const icon = document.createElement("Text");

    let iconString = "";

    switch (newStep.appliedRule) {
        case ProofModeMove.DC_INSERT:
            iconString = "dot-circle-o";
            break;
        case ProofModeMove.DC_DELETE:
            iconString = "times-circle";
            break;
        case ProofModeMove.MOVE_SINGLE:
            iconString = "mouse-pointer";
            break;
        case ProofModeMove.MOVE_MULTI:
            iconString = "arrows";
            break;
        case ProofModeMove.ITERATION:
            iconString = "expand";
            break;
        case ProofModeMove.DEITERATION:
            iconString = "compress";
            break;
        case ProofModeMove.INSERTION:
            iconString = "plus";
            break;
        case ProofModeMove.ERASURE:
            iconString = "trash";
            break;
        case ProofModeMove.RESIZE:
            iconString = "arrows-alt";
            break;
        case ProofModeMove.PASTE_GRAPH:
            iconString = "files-o";
            break;
    }

    icon.className = "fa fa-" + iconString;

    button.appendChild(icon);
    newDiv.appendChild(button);
    document.getElementById("proofHistoryBar")?.appendChild(newDiv);
}

/**
 * Sets the incoming ProofNode to be the current step and redraws the canvas to represent that.
 * Called when a proof step is pushed.
 *
 * @param selectedStep Incoming ProofNode.
 */
export function stepBack(selectedStep: ProofModeNode): void {
    TreeContext.currentProofStep = selectedStep;
    redrawProof();
}

/**
 * Removes buttons related to proof steps that are no longer a part of the proof.
 *
 * @param stopIndex The index to stop removing buttons.
 */
export function deleteButtons(stopIndex: number): void {
    for (let i = TreeContext.proof.length; i > stopIndex + 1; i--) {
        document.getElementById("Row: " + i)?.remove();
    }
}

/**
 * Removes the most recent move's button from the proof bar.
 */
export function deleteMostRecentButton(): void {
    document.getElementById("Row: " + TreeContext.proof.length)?.remove();
}
