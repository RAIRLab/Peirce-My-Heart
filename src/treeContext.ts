import {AEGTree} from "./AEG/AEGTree";
import {ProofList} from "./AEG/ProofList";
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
    toProofMode,
    doubleCutInsertionTool,
    doubleCutDeletionTool,
    erasureTool,
}

export class treeContext {
    //The current tree on the the canvas, needs to be redrawn upon any updates.
    public static tree: AEGTree = new AEGTree();

    //A history of the proof constructed
    public static proofHistory: ProofList = new ProofList();

    //The node selected on draw mode which will copy over when we toggle to proof mode.
    public static selectForProof: AEGTree = new AEGTree();

    //Used to determine the current mode the program is in.
    public static toolState: Tool = Tool.none;

    //An indicator of the mode that we are currently on
    public static modeState: "Draw" | "Proof" = "Draw";
}
