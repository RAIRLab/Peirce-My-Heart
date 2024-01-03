import {AEGTree} from "./AEG/AEGTree";
import {loadFile} from "./AEG-IO";
import {ProofNode} from "./Proof/ProofNode";
import {proofString, treeString} from "./index";
import {redrawProof, redrawTree} from "./SharedToolUtils/DrawUtils";
import {Tool, TreeContext} from "./TreeContext";

/**
 * Contains the event handler to toggle between Draw Mode and Proof Mode.
 *
 * @author James Oswald
 * @author Anusha Tiwari
 */

//True for Draw Mode, false for Proof Mode.
let drawMode = true;

//AEG on the canvas in Draw Mode. Stored on Proof Mode toggle and reloaded on Draw Mode toggle.
let drawCachedAEG: string | null = null;
//AEG on the canvas in Proof Mode. Stored on Draw Mode toggle and reloaded on Proof Mode toggle.
let proofCachedAEG: string | null = null;

//Tool selected in Draw Mode. Stored on Proof Mode toggle and reloaded on Draw Mode toggle.
let drawCachedTool: Tool = Tool.none;
//Tool selected in Proof Mode. Stored on Draw Mode toggle and reloaded on Proof Mode toggle.
let proofCachedTool: Tool = Tool.none;

const drawButtons = document.getElementById("DrawButtons")!;
const proofButtons = document.getElementById("ProofButtons")!;
const proofHistoryBar = <HTMLParagraphElement>document.getElementById("proofHistoryBar");

/**
 * Caches the states of AEGs and tools for both Draw and Proof Mode.
 * Updates button visibility accordingly.
 */
export function toggleHandler(): void {
    //Toggle drawMode since we have switched modes.
    drawMode = !drawMode;
    if (drawMode) {
        //Remove visibility of Proof Mode buttons for Draw Mode.
        drawButtons.style.display = "block";
        treeString.style.display = "block";
        proofButtons.style.display = "none";
        proofString.style.display = "none";
        proofHistoryBar.style.display = "none";
        TreeContext.modeState = "Draw";

        //Cache Proof Mode tree and tool states so we can load them back in on Proof Mode toggle.
        proofCachedAEG = JSON.stringify(TreeContext.proof);
        proofCachedTool = TreeContext.toolState;

        //Load our saved Draw Mode tree and tool states.
        let loadedAEG: AEGTree | null = null;
        if (drawCachedAEG !== null) {
            loadedAEG = loadFile(TreeContext.modeState, drawCachedAEG) as AEGTree | null;
        }
        if (loadedAEG !== null) {
            TreeContext.tree.sheet = loadedAEG.sheet;
        } else {
            throw Error("invalid cached AEG");
        }
        TreeContext.toolState = drawCachedTool;
        redrawTree(TreeContext.tree);
    } else {
        //Display buttons for Proof Mode.
        drawButtons.style.display = "none";
        treeString.style.display = "none";
        proofButtons.style.display = "block";
        proofString.style.display = "block";
        proofHistoryBar.style.display = "block";
        TreeContext.modeState = "Proof";

        //Cache Draw Mode tree and tool states so we can load them back in on Draw Mode toggle.
        drawCachedAEG = JSON.stringify(TreeContext.tree);
        drawCachedTool = TreeContext.toolState;

        if (TreeContext.proof.length === 0) {
            TreeContext.pushToProof(new ProofNode());
        }

        //Load our proof structure and tool state.
        let loadedProof: ProofNode[] | null = null;
        if (proofCachedAEG !== null) {
            loadedProof = loadFile(TreeContext.modeState, proofCachedAEG) as ProofNode[] | null;
        }
        if (loadedProof !== null) {
            TreeContext.proof = loadedProof;
        }

        //Reset our tool states.
        TreeContext.toolState = proofCachedTool;
        redrawProof();
    }
}
