/**
 * Creates the history bar on the left side of the screen and handles returning to a previous state.
 * @author Dawn Moore
 */

import {treeContext} from "./treeContext";
import {redrawProof} from "./DrawModes/DrawUtils";
import {ProofNode} from "./AEG/ProofNode";

export function appendStep(newStep: ProofNode) {
    const newDiv = document.createElement("div");
    newDiv.className = "row";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "proofNodeButton";
    button.title = newStep.tree.toString();
    //button.onclick() = stepBack(newStep);

    const stepContainer = document.createElement("span");
    stepContainer.id = "proofNodeText";
    const stepType = document.createTextNode(newStep.appliedRule);
    stepContainer.appendChild(stepType);

    newDiv.appendChild(button);
    newDiv.appendChild(stepContainer);
    document.getElementById("proofHistoryBar")?.appendChild(newDiv);
}

export function stepBack(selectedStep: ProofNode) {
    const index: number = treeContext.proof.indexOf(selectedStep);
    if (index !== -1) {
        treeContext.proof = treeContext.proof.slice(0, index);
    }

    redrawProof();
}
