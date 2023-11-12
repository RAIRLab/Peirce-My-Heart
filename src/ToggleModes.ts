/**
 * File containing the event handler to toggle between Draw Mode and Proof Mode
 * @author James Oswald
 * @author Anusha Tiwari
 */
import {loadFile} from "./AEG-IO";
import {AEGTree} from "./AEG/AEGTree";
import {ProofNode} from "./AEG/ProofNode";
import {redrawTree} from "./DrawModes/DrawUtils";
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
        proofButtons.style.display = "none";

        //cache the proof tree and tool state so that we can load it back in when we toggle again
        proofCachedAEG = JSON.stringify(treeContext.tree);
        proofCachedTool = treeContext.toolState;

        //Load in our saved draw tree and tool state
        const loadedAEG = loadFile(drawCachedAEG);
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
        proofButtons.style.display = "block";

        //cache the draw tree and tool state so that we can load it back in when we toggle again
        drawCachedAEG = JSON.stringify(treeContext.tree);
        drawCachedTool = treeContext.toolState;

        //Load in our saved proof structure and tool state
        const loadedProof = loadFile(proofCachedAEG);
        let proofTree: AEGTree;
        if (loadedProof !== null) {
            proofTree = new AEGTree(loadedProof.sheet);
            //treeContext.tree.sheet = loadedProof.sheet;

            //If the user selected something to be copied over from draw mode,
            //insert it into our existing proof structure
            for (let i = 0; i < treeContext.selectForProof.sheet.children.length; i++) {
                const child = treeContext.selectForProof.sheet.children[i];
                try {
                    proofTree.insert(child);
                } catch (error) {
                    console.log("Could not insert " + child);
                }
            }

            treeContext.proofHistory.insertAtEnd(new ProofNode(proofTree));
        } else {
            //If there is no saved proof and the user selected something to be copied over from
            //draw mode, make that our proof structure
            proofTree = new AEGTree(treeContext.selectForProof.sheet);
            treeContext.proofHistory.insertAtEnd(new ProofNode(proofTree));
        }

        //Reset the state of our tools
        treeContext.toolState = proofCachedTool;
        //The selected node has been loaded in.
        //Reset it to avoid accidentally reloading it next time.
        treeContext.selectForProof.sheet = new AEGTree().sheet;

        if (treeContext.proofHistory.head !== null) {
            const currentProof = treeContext.proofHistory.getLastNode(
                treeContext.proofHistory.head
            ).tree;

            if (currentProof !== null) {
                redrawTree(currentProof);
            }
        } else {
            treeContext.proofHistory.head = new ProofNode(new AEGTree());
            redrawTree(treeContext.proofHistory.head.tree);
        }
    }
    // redrawTree(treeContext.tree);
}
