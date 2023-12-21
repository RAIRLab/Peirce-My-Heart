import {AEGTree} from "./AEG/AEGTree";
import {appendStep, deleteButtons} from "./ProofHistory";
import {ProofNode} from "./AEG/ProofNode";

/**
 * Describes the state of the AEGTree and other related attributes.
 *
 * @author Anusha Tiwari
 */

/**
 * Enum to represent the current drawing mode the program is currently in.
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
    //The current tree on the the canvas, needs to be redrawn upon any updates.
    public static tree: AEGTree = new AEGTree();

    //The proof being constructed
    public static proof: ProofNode[] = [];

    //The node denoting the current step that we are on in the proof
    public static currentProofStep: ProofNode | undefined;

    //The node selected on draw mode which will copy over when we toggle to proof mode.
    public static selectForProof: AEGTree = new AEGTree();

    //Used to determine the current mode the program is in.
    public static toolState: Tool = Tool.none;

    //An indicator of the mode that we are currently on
    public static modeState: "Draw" | "Proof" = "Draw";

    /**
     * Method to get the last step in the proof.
     * @returns The node denoting the last step in the proof.
     */
    public static getLastProofStep(): ProofNode {
        if (TreeContext.proof.length === 0) {
            return new ProofNode(new AEGTree());
        }

        return TreeContext.proof[TreeContext.proof.length - 1];
    }

    /**
     * Adds the recently created proof node into the proof array and creates a new button for it.
     * Sets the current step to this new step. If the current step is not the newest step then
     * the array up to that step needs to be removed.
     * @param newStep The new proof node being added to the proof
     */
    public static pushToProof(newStep: ProofNode) {
        if (newStep.appliedRule === "Pasted") {
            this.proof.pop();
            document.getElementById("Row: 1")?.remove();
            newStep.index = 0;
        } else if (this.currentProofStep && this.proof.length > 0) {
            //Compare the current step we are on and the last step stored in the history
            //If they are not the same, we have moved back to a previous step and need to delete
            //all the steps in between
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

        //Set the newest performed step as the current step, and it to the proof
        this.currentProofStep = newStep;
        this.proof.push(newStep);
        appendStep(newStep);
    }

    /**
     * Clears the proof by resetting the array and the current step of the proof
     */
    public static clearProof() {
        deleteButtons(-1);
        this.proof = [];
        this.pushToProof(new ProofNode());
        this.currentProofStep = this.proof[0];
    }
}
