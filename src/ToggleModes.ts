import {AEGTree} from "./AEG/AEGTree";
import {loadFile} from "./AEG-IO";
import {ProofNode} from "./AEG/ProofNode";
import {proofString, treeString} from ".";
import {redrawProof, redrawTree} from "./SharedToolUtils/DrawUtils";
import {Tool, TreeContext} from "./TreeContext";

/**
 * Contains the event handler to toggle between Draw Mode and Proof Mode.
 *
 * @author James Oswald
 * @author Anusha Tiwari
 */

//Flag to signify the mode we are in
let drawMode = true; //we start in draw mode

//This is the AEG that is on the canvas during draw mode
//It is saved when toggled to proof mode and reloaded when toggled back to draw mode
let drawCachedAEG: string | null = null;
let proofCachedAEG: string | null = null;

//This is the tool we were using during draw mode
//It is saved when toggled to proof mode and reloaded when toggled back to draw mode
let drawCachedTool: Tool = Tool.none;
let proofCachedTool: Tool = Tool.none;

const drawButtons = document.getElementById("DrawButtons")!;
const proofButtons = document.getElementById("ProofButtons")!;
const proofHistoryBar = <HTMLParagraphElement>document.getElementById("proofHistoryBar");

export function toggleHandler(): void {
    //Toggle the value of the flag because the mode has been changed
    drawMode = !drawMode;
    if (drawMode) {
        //Display the buttons for Draw Mode
        drawButtons.style.display = "block";
        treeString.style.display = "block";
        proofButtons.style.display = "none";
        proofString.style.display = "none";
        proofHistoryBar.style.display = "none";
        TreeContext.modeState = "Draw";

        //cache the proof tree and tool state so that we can load it back in when we toggle again
        proofCachedAEG = JSON.stringify(TreeContext.proof);
        proofCachedTool = TreeContext.toolState;

        //Load in our saved draw tree and tool state
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
        //Display the buttons for Proof Mode
        drawButtons.style.display = "none";
        treeString.style.display = "none";
        proofButtons.style.display = "block";
        proofString.style.display = "block";
        proofHistoryBar.style.display = "block";
        TreeContext.modeState = "Proof";

        //cache the draw tree and tool state so that we can load it back in when we toggle again
        drawCachedAEG = JSON.stringify(TreeContext.tree);
        drawCachedTool = TreeContext.toolState;

        if (TreeContext.proof.length === 0) {
            TreeContext.pushToProof(new ProofNode());
        }

        //Load in our saved proof structure and tool state
        let loadedProof: ProofNode[] | null = null;
        if (proofCachedAEG !== null) {
            loadedProof = loadFile(TreeContext.modeState, proofCachedAEG) as ProofNode[] | null;
        }
        if (loadedProof !== null) {
            TreeContext.proof = loadedProof;
        }
        //Reset the state of our tools
        TreeContext.toolState = proofCachedTool;
        redrawProof();
    }
}
