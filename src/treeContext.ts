import {AEGTree} from "./AEG/AEGTree";
import {ProofNode} from "./AEG/ProofNode";
// import {Tool} from "./index";

/**
 * The global context describing the state of the AEG Tree and other related attributes
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
}

export class treeContext {
    //The current tree on the the canvas, needs to be redrawn upon any updates.
    public static tree: AEGTree = new AEGTree();

    //The proof being constructed
    public static proof: ProofNode[] = [];

    //The node denoting the current step that we are on in the proof
    public static currentProofStep: ProofNode;

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
        if (treeContext.proof.length === 0) {
            return new ProofNode(new AEGTree());
        }

        return treeContext.proof[treeContext.proof.length - 1];
    }
}
