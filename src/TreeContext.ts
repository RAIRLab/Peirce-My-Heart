/**
 * Describes the state of the AEGTree and other related attributes.
 *
 * @author Anusha Tiwari
 */

import {AEGTree} from "./AEG/AEGTree";
import {appendStep, deleteButtons} from "./Proof/ProofHistory";
import {ProofNode} from "./Proof/ProofNode";

/**
 * Represents the current tool in use.
 */
export enum Tool {
    none,
    atomTool,
    cutTool,
    dragTool,
    moveSingleTool,
    moveMultiTool,
    copySingleTool,
    copyMultiTool,
    deleteSingleTool,
    deleteMultiTool,
    resizeTool,
    copyFromDrawTool,
    pasteInProofTool,
    doubleCutInsertionTool,
    doubleCutDeletionTool,
    insertionTool,
    erasureTool,
    proofMoveSingleTool,
    proofMoveMultiTool,
    proofResizeTool,
    iterationTool,
    deiterationTool,
    clearProofTool,
}

export class TreeContext {
    //Current AEGTree on canvas.
    public static tree: AEGTree = new AEGTree();

    //The proof is a series of ProofNodes.
    public static proof: ProofNode[] = [];

    //Current step in the proof.
    public static currentProofStep: ProofNode | undefined;

    //Node selected with Draw Mode's "Select for copy to Proof Mode" button.
    public static selectForProof: AEGTree = new AEGTree();

    //Tool currently in use.
    public static toolState: Tool = Tool.none;

    //Mode the application is in. Defaults to Draw.
    public static modeState: "Draw" | "Proof" = "Draw";

    /**
     * Returns the most recent step in the proof.
     *
     * @returns Most recent step in the proof.
     */
    public static getLastProofStep(): ProofNode {
        if (TreeContext.proof.length === 0) {
            return new ProofNode(new AEGTree());
        }

        return TreeContext.proof[TreeContext.proof.length - 1];
    }

    /**
     * Adds the incoming ProofNode into proof and creates a new button for the step
     * in the proof history bar.
     * Then updates globals accordingly.
     *
     * @param newStep Incoming ProofNode.
     */
    public static pushToProof(newStep: ProofNode): void {
        if (newStep.appliedRule === "Pasted") {
            this.proof.pop();
            document.getElementById("Row: 1")?.remove();
            newStep.index = 0;
        } else if (this.currentProofStep && this.proof.length > 0) {
            //Compare the current step we are on and the last step stored in the history.
            //If they are not the same, we have moved back to a previous step and need to delete
            //all the steps in between to prevent timeline clashes.
            if (
                !this.currentProofStep.tree.isEqualTo(this.proof[this.proof.length - 1].tree) ||
                this.currentProofStep.appliedRule !== this.proof[this.proof.length - 1].appliedRule
            ) {
                const currentIndex: number = this.currentProofStep.index;
                deleteButtons(currentIndex);
                this.proof = this.proof.splice(0, currentIndex + 1);
                newStep.index = this.proof.length;
            }
        }

        this.currentProofStep = newStep;
        this.proof.push(newStep);
        appendStep(newStep);
    }

    /**
     * Resets the proof history array and eliminates all proof steps.
     */
    public static clearProof(): void {
        deleteButtons(-1);
        this.proof = [];
        this.pushToProof(new ProofNode());
        this.currentProofStep = this.proof[0];
    }
}
