import { loadFile } from "./AEG-IO";
import { AEGTree } from "./AEG/AEGTree";
import { redrawTree } from "./DrawModes/DrawUtils";
import { Mode, tree, modeState, setMode } from "./index"

let drawMode = true; //we start in draw mode

//This is the AEG that is on the canvas during draw mode
//It is saved when stopped to proof mode and reloaded 
let cachedAEG : string | null = null;
let cachedMode: Mode | null = null

const drawButtons = document.getElementById("DrawButtons")!;
const proofButtons = document.getElementById("ProofButtons")!;

export function toggleHandler() : void{
    drawMode = !drawMode
    if(drawMode){
        drawButtons.style.display = "block";
        proofButtons.style.display = "none";
        let loadedAEG = loadFile(cachedAEG);
        if(loadedAEG != null){
            tree.sheet = loadedAEG.sheet;
        }else{
            throw Error("invalid cached AEG");
        }
        setMode(cachedMode);
    }else{
        drawButtons.style.display = "none";
        proofButtons.style.display = "block";
        cachedAEG = JSON.stringify(tree);
        cachedMode = modeState;
        tree.sheet = new AEGTree().sheet;
        setMode(null);
    }
    redrawTree(tree);
}