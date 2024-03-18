/**
 * @file Describes the state of the AEGTree and other related attributes.
 *
 * @author Anusha Tiwari
 */

import {AEGTree} from "./AEG/AEGTree";
import {appendStep, deleteButtons, deleteMostRecentButton, stepBack} from "./Proof/ProofHistory";
import {DrawModeMove} from "./History/DrawModeMove";
import {DrawModeNode} from "./History/DrawModeNode";
import {DrawModeStack} from "./History/DrawModeStack";
import {ProofModeMove} from "./Proof/ProofModeMove";
import {ProofNode} from "./Proof/ProofNode";
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
    public static drawHistoryUndoStack: DrawModeStack = new DrawModeStack();

    public static drawHistoryRedoStack: DrawModeStack = new DrawModeStack();

    private static recentlyUndoneOrRedoneMove = false;

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
     * Adds the incoming DrawModeMove and the current tree to drawHistory.
     *
     * @param newlyAppliedStep Incoming DrawModeMove.
     */
    public static pushToDrawStack(newlyAppliedStep: DrawModeMove): void {
        if (this.recentlyUndoneOrRedoneMove) {
            this.drawHistoryRedoStack.clear();
            this.recentlyUndoneOrRedoneMove = false;
        }
        this.drawHistoryUndoStack.push(new DrawModeNode(this.tree, newlyAppliedStep));
    }

    /**
     * Pops the most recent draw mode move from drawHistory and changes tree accordingly.
     */
    public static undoDrawStep(): void {
        const mostRecentStep: DrawModeNode | null = this.drawHistoryUndoStack.pop();

        if (mostRecentStep === null || this.drawHistoryUndoStack.peek() === null) {
            this.tree = new AEGTree();
            redrawTree(this.tree);
            return;
        }

        this.drawHistoryRedoStack.push(mostRecentStep);

        this.tree = new AEGTree(this.drawHistoryUndoStack.peek().tree.sheet);

        redrawTree(this.tree);

        this.recentlyUndoneOrRedoneMove = true;
    }

    public static redoDrawStep(): void {
        const mostRecentStep: DrawModeNode | null = this.drawHistoryRedoStack.pop();

        if (mostRecentStep === null || this.drawHistoryUndoStack.peek() === null) {
            return;
        }

        this.drawHistoryUndoStack.push(mostRecentStep);

        //i seem to have accidentally made the correct procedure by copy/pasting the incorrect name
        //here and below are all supposed to be drawHistoryRedoStack but that ruins the behavior
        this.tree = new AEGTree(this.drawHistoryUndoStack.peek().tree.sheet);

        redrawTree(this.tree);

        this.recentlyUndoneOrRedoneMove = true;
    }

    public static undoProofStep(): void {
        if (this.proof.length <= 1) {
            return;
        }

        const stepToRemove: ProofNode = this.proof[this.proof.length - 1 - 1];

        this.tree = new AEGTree(stepToRemove.tree.sheet);
        this.proof.splice(this.proof.length - 1, 1)[0];
        stepBack(this.proof[this.proof.length - 1]);
        redrawProof();
    }

    public static redoProofStep(): void {
        redrawProof();
    }

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
        this.pushToProof(new ProofNode());
        this.currentProofStep = this.proof[0];
    }
}
