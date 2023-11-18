/**
 * File containing the event handler to toggle between Draw Mode and Proof Mode
 * @author James Oswald
 * @author Anusha Tiwari
 */
import {loadFile} from "./AEG-IO";
import {AEGTree} from "./AEG/AEGTree";
import {ProofNode} from "./AEG/ProofNode";
import {redrawProof, redrawTree} from "./DrawModes/DrawUtils";
import {treeString, proofString} from ".";
// import {setMode} from "./index";
// import {selectedNode} from "./DrawModes/ToProofMode";
import {Tool, treeContext} from "./treeContext";

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

export function toggleHandler(): void {
    //Toggle the value of the flag because the mode has been changed
    drawMode = !drawMode;
    if (drawMode) {
        //Display the buttons for Draw Mode
        drawButtons.style.display = "block";
        treeString.style.display = "block";
        proofButtons.style.display = "none";
        proofString.style.display = "none";
        treeContext.modeState = "Draw";

        //cache the proof tree and tool state so that we can load it back in when we toggle again
        proofCachedAEG = JSON.stringify(treeContext.proofHistory);
        proofCachedTool = treeContext.toolState;

        //Load in our saved draw tree and tool state
        const loadedAEG = loadFile(treeContext.modeState, drawCachedAEG) as AEGTree | null;
        if (loadedAEG !== null) {
            treeContext.tree.sheet = loadedAEG.sheet;
        } else {
            throw Error("invalid cached AEG");
        }
        treeContext.toolState = drawCachedTool;
        redrawTree(treeContext.tree);
    } else {
        //Display the buttons for Proof Mode
        drawButtons.style.display = "none";
        treeString.style.display = "none";
        proofButtons.style.display = "block";
        proofString.style.display = "block";
        treeContext.modeState = "Proof";

        //cache the draw tree and tool state so that we can load it back in when we toggle again
        drawCachedAEG = JSON.stringify(treeContext.tree);
        drawCachedTool = treeContext.toolState;

        //Load in our saved proof structure and tool state
        const loadedProof = loadFile(treeContext.modeState, proofCachedAEG) as ProofNode[] | null;
        if (loadedProof !== null) {
            treeContext.proofHistory = loadedProof;
            /* //Construct the next tree from the last tree in the proof
            const nextTree = new AEGTree(
                treeContext.proofHistory[treeContext.proofHistory.length - 1].tree.sheet
            );

            //If the user selected something to be copied over from draw mode,
            //insert it into the next tree
            if (treeContext.selectForProof.sheet.children.length > 0) {
                for (let i = 0; i < treeContext.selectForProof.sheet.children.length; i++) {
                    const child = treeContext.selectForProof.sheet.children[i];
                    try {
                        nextTree.insert(child);
                    } catch (error) {
                        console.log("Could not insert " + child);
                    }
                }

                treeContext.proofHistory.push(new ProofNode(nextTree));
            } */
        } /* else {
            //If there is no saved proof and the user selected something to be copied over from
            //draw mode, make that our proof structure
            const proofTree = new AEGTree(treeContext.selectForProof.sheet);
            treeContext.proofHistory.push(new ProofNode(proofTree));
        } */

        //Reset the state of our tools
        treeContext.toolState = proofCachedTool;
        //The selected node has been loaded in.
        //Reset it to avoid accidentally reloading it next time.
        treeContext.selectForProof.sheet = new AEGTree().sheet;

        redrawProof();
    }
}
