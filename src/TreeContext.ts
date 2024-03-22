/**
 * @file Describes the state of the AEGTree and other related attributes.
 *
 * @author Anusha Tiwari
 */

import {AEGTree} from "./AEG/AEGTree";
import {
    appendStep,
    deleteButtons,
    deleteMostRecentButton,
    stepBack,
} from "./ProofHistory/ProofHistory";
import {DrawModeMove, DrawModeNode} from "./DrawHistory/DrawModeNode";
import {ProofModeMove, ProofModeNode} from "./ProofHistory/ProofModeNode";
import {redrawProof, redrawTree} from "./SharedToolUtils/DrawUtils";

/**
 * Represents the current tool in use.
 */
export enum Tool {
    none,
    atomTool,
    cutTool,
    dragTool,
    drawMoveSingleTool,
    drawMoveMultiTool,
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
    proofClearTool,
    drawClearTool,
}

export class TreeContext {
    //Current AEGTree on canvas.
    public static tree: AEGTree = new AEGTree();

    //For undoing changes in Draw Mode.
    public static drawHistoryUndoStack: DrawModeNode[] = [];

    //For redoing changes in Draw Mode.
    public static drawHistoryRedoStack: DrawModeNode[] = [];

    //Determines when to clear drawHistoryRedoStack.
    private static recentlyUndoneOrRedoneDrawMove = false;

    //The proof is a series of ProofNodes.
    public static proof: ProofModeNode[] = [];

    //For redoing changes in Proof Mode.
    public static proofHistoryRedoStack: ProofModeNode[] = [];

    //Determines when to clear proofHistoryRedoStack.
    private static recentlyUndoneOrRedoneProofMove = false;

    //Current step in the proof.
    public static currentProofStep: ProofModeNode | undefined;

    //Node selected with Draw Mode's "Select for copy to Proof Mode" button.
    public static selectForProof: AEGTree = new AEGTree();

    //Tool currently in use.
    public static toolState: Tool = Tool.none;

    //Mode the application is in. Defaults to Draw.
    public static modeState: "Draw" | "Proof" = "Draw";

    /**
     * Adds the incoming DrawModeMove and the current tree to drawHistory.
     *
     * @param newlyAppliedStep Incoming DrawModeMove.
     */
    public static pushToDrawStack(newlyAppliedStep: DrawModeMove): void {
        if (this.recentlyUndoneOrRedoneDrawMove) {
            this.drawHistoryRedoStack = [];
            this.recentlyUndoneOrRedoneDrawMove = false;
        }
        this.drawHistoryUndoStack.push(new DrawModeNode(this.tree, newlyAppliedStep));
    }

    /**
     * Pops the most recent Draw Mode move from drawHistoryUndoStack and changes tree accordingly.
     */
    public static undoDrawStep(): void {
        const mostRecentStep: DrawModeNode | undefined = this.drawHistoryUndoStack.pop();

        if (
            mostRecentStep === undefined ||
            this.drawHistoryUndoStack[this.drawHistoryUndoStack.length - 1] === undefined
        ) {
            this.tree = new AEGTree();
            redrawTree(this.tree);
            return;
        }

        this.drawHistoryRedoStack.push(mostRecentStep);

        this.tree = new AEGTree(
            this.drawHistoryUndoStack[this.drawHistoryUndoStack.length - 1].tree.sheet
        );

        redrawTree(this.tree);

        this.recentlyUndoneOrRedoneDrawMove = true;
    }

    /**
     * Pops the most recent Draw Mode move from drawHistoryRedoStack and changes tree accordingly.
     */
    public static redoDrawStep(): void {
        const mostRecentStep: DrawModeNode | undefined = this.drawHistoryRedoStack.pop();

        if (
            mostRecentStep === undefined ||
            this.drawHistoryUndoStack[this.drawHistoryUndoStack.length - 1] === undefined
        ) {
            return;
        }

        this.drawHistoryUndoStack.push(mostRecentStep);

        this.tree = new AEGTree(
            this.drawHistoryUndoStack[this.drawHistoryUndoStack.length - 1].tree.sheet
        );

        redrawTree(this.tree);

        this.recentlyUndoneOrRedoneDrawMove = true;
    }

    /**
     * Undoes the most recent Proof Mode move and deletes that button.
     */
    public static undoProofStep(): void {
        if (this.proof.length <= 1) {
            this.clearProof();
            return;
        }

        const stepToRemove: ProofModeNode = this.proof[this.proof.length - 1];

        deleteMostRecentButton();

        this.proofHistoryRedoStack.push(stepToRemove);

        this.proof.pop();
        stepBack(this.proof[this.proof.length - 1]);
        redrawProof();

        this.recentlyUndoneOrRedoneProofMove = true;
    }

    /**
     * Pops the most recent Proof Mode move from proofHistoryRedoStack and updates proof bar.
     */
    public static redoProofStep(): void {
        if (this.proofHistoryRedoStack.length === 0) {
            return;
        }

        const mostRecentStep: ProofModeNode | undefined = this.proofHistoryRedoStack.pop();

        if (mostRecentStep === undefined || this.proof[this.proof.length - 1] === undefined) {
            return;
        }

        this.recentlyUndoneOrRedoneProofMove = false;

        this.pushToProof(mostRecentStep);

        stepBack(this.proof[this.proof.length - 1]);
        redrawProof();
    }

    /**
     * Returns the most recent step in the proof.
     *
     * @returns Most recent step in the proof.
     */
    public static getLastProofStep(): ProofModeNode {
        if (TreeContext.proof.length === 0) {
            return new ProofModeNode(new AEGTree());
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
    public static pushToProof(newStep: ProofModeNode): void {
        if (this.recentlyUndoneOrRedoneProofMove) {
            this.proofHistoryRedoStack = [];
            this.recentlyUndoneOrRedoneProofMove = false;
        }

        if (newStep.appliedRule === ProofModeMove.PASTE_GRAPH) {
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
        this.pushToProof(new ProofModeNode());
        this.currentProofStep = this.proof[0];
    }
}
