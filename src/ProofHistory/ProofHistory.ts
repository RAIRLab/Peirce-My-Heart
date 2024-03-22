/**
 * @file Creates the proof history bar on the left side of the screen
 * and handles returning to a previous step.
 *
 * @author Dawn Moore
 */

import {ProofModeMove, ProofModeNode} from "./ProofModeNode";
import {redrawProof} from "../SharedToolUtils/DrawUtils";
import {TreeContext} from "../TreeContext";

const proofMoveToIconStringDict: {[key in ProofModeMove]: string} = {
    [ProofModeMove.CLEAR]: "",
    [ProofModeMove.DC_INSERT]: "dot-circle-o",
    [ProofModeMove.DC_DELETE]: "times-circle",
    [ProofModeMove.MOVE_SINGLE]: "mouse-pointer",
    [ProofModeMove.MOVE_MULTI]: "arrows",
    [ProofModeMove.ITERATION]: "expand",
    [ProofModeMove.DEITERATION]: "compress",
    [ProofModeMove.INSERTION]: "plus",
    [ProofModeMove.ERASURE]: "trash",
    [ProofModeMove.RESIZE]: "arrows-alt",
    [ProofModeMove.PASTE_GRAPH]: "files-o",
};

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

    const iconString = proofMoveToIconStringDict[newStep.appliedRule];

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
