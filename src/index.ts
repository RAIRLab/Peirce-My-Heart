/**
 * A program to draw ellipses and atoms.
 * @author Dawn Moore
 * @author James Oswald
 * @author Anusha Tiwari
 */

import {AEGTree} from "./AEG/AEGTree";
import {Tool, treeContext} from "./treeContext";
import {cutMouseDown, cutMouseMove, cutMouseOut, cutMouseUp} from "./DrawModes/CutTool";
import {
    atomKeyPress,
    atomMouseDown,
    atomMouseMove,
    atomMouseUp,
    atomMouseOut,
} from "./DrawModes/AtomTool";
import {saveFile, loadFile} from "./AEG-IO";
import {redrawProof, redrawTree} from "./DrawModes/DrawUtils";
import {dragMosueOut, dragMouseDown, dragMouseMove} from "./DrawModes/DragTool";
import {
    moveSingleMouseDown,
    moveSingleMouseMove,
    moveSingleMouseUp,
    moveSingleMouseOut,
} from "./DrawModes/MoveSingleTool";
import {
    moveMultiMouseDown,
    moveMultiMouseMove,
    moveMultiMouseUp,
    moveMultiMouseOut,
} from "./DrawModes/MoveMultiTool";
import {
    copySingleMouseDown,
    copySingleMouseMove,
    copySingleMouseUp,
    copySingleMouseOut,
} from "./DrawModes/CopySingleTool";
import {
    copyMultiMouseDown,
    copyMultiMouseMove,
    copyMultiMouseUp,
    copyMultiMouseOut,
} from "./DrawModes/CopyMultiTool";
import {
    deleteSingleMouseDown,
    deleteSingleMouseMove,
    deleteSingleMouseOut,
    deleteSingleMouseUp,
} from "./DrawModes/DeleteSingleTool";

import {
    deleteMultiMouseDown,
    deleteMultiMouseMove,
    deleteMultiMouseOut,
    deleteMultiMouseUp,
} from "./DrawModes/DeleteMultiTool";
import {
    copyFromDrawMouseDown,
    copyFromDrawMouseMove,
    copyFromDrawMouseUp,
    copyFromDrawMouseOut,
} from "./DrawModes/copyFromDraw";
import {
    doubleCutInsertionMouseDown,
    doubleCutInsertionMouseMove,
    doubleCutInsertionMouseUp,
    doubleCutInsertionMouseOut,
} from "./ProofTools/DoubleCutInsertionTool";
import {
    doubleCutDeletionMouseDown,
    doubleCutDeletionMouseMove,
    doubleCutDeletionMouseUp,
    doubleCutDeletionMouseOut,
} from "./ProofTools/DoubleCutDeletionTool";
import {
    insertionMouseDown,
    insertionMouseMove,
    insertionMouseOut,
    insertionMouseUp,
} from "./ProofTools/InsertionTools";
import {
    erasureMouseDown,
    erasureMouseMove,
    erasureMouseUp,
    erasureMouseOut,
} from "./ProofTools/ErasureTool";
import {toggleHandler} from "./ToggleModes";
import {
    resizeMouseDown,
    resizeMouseMove,
    resizeMouseUp,
    resizeMouseOut,
} from "./DrawModes/ResizeTool";
import {
    proofMoveSingleMouseDown,
    proofMoveSingleMouseMove,
    proofMoveSingleMouseOut,
    proofMoveSingleMouseUp,
} from "./ProofTools/ProofMoveSingleTool";
import {
    proofMoveMultiMouseDown,
    proofMoveMultiMouseMove,
    proofMoveMultiMouseOut,
    proofMoveMultiMouseUp,
} from "./ProofTools/ProofMoveMultiTool";
import {ProofNode} from "./AEG/ProofNode";
import {
    pasteInProofMouseDown,
    pasteInProofMouseMove,
    pasteInProofMouseOut,
    pasteInProofMouseUp,
} from "./ProofTools/pasteInProof";
import {
    iterationMouseDown,
    iterationMouseMove,
    iterationMouseUp,
    iterationMouseOut,
} from "./ProofTools/IterationTool";

//Setting up Canvas
const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const res: CanvasRenderingContext2D | null = canvas.getContext("2d");
if (res === null) {
    throw Error("2d rendering context not supported");
}
const ctx: CanvasRenderingContext2D = res;
ctx.font = "35pt arial";

//Global State
const cutTools = <HTMLParagraphElement>document.getElementById("cutTools");
const atomTools = <HTMLParagraphElement>document.getElementById("atomTools");
export const treeString = <HTMLParagraphElement>document.getElementById("graphString");
export const proofString = <HTMLParagraphElement>document.getElementById("proofString");
const selectionDisplay = <HTMLParagraphElement>document.getElementById("toProofTools");

window.addEventListener("keydown", keyDownHandler);
canvas.addEventListener("mousedown", mouseDownHandler);
canvas.addEventListener("mousemove", mouseMoveHandler);
canvas.addEventListener("mouseup", mouseUpHandler);
canvas.addEventListener("mouseout", mouseOutHandler);
canvas.addEventListener("mouseenter", mouseEnterHandler);

//Boolean value representing whether the mouse button is down. Assumed to not be down at the start.
let hasMouseDown = false;

//Boolean value representing whether the mouse is in the canvas. Assumed to be in at the start.
let hasMouseIn = true;

//Window Exports
window.atomTool = Tool.atomTool;
window.cutTool = Tool.cutTool;
window.dragTool = Tool.dragTool;
window.saveMode = saveMode;
window.loadMode = loadMode;
window.moveSingleTool = Tool.moveSingleTool;
window.moveMultiTool = Tool.moveMultiTool;
window.copySingleTool = Tool.copySingleTool;
window.copyMultiTool = Tool.copyMultiTool;
window.deleteSingleTool = Tool.deleteSingleTool;
window.deleteMultiTool = Tool.deleteMultiTool;
window.copyFromDrawTool = Tool.copyFromDrawTool;
window.pasteInProofTool = Tool.pasteInProofTool;
window.doubleCutInsertionTool = Tool.doubleCutInsertionTool;
window.resizeTool = Tool.resizeTool;
window.doubleCutDeletionTool = Tool.doubleCutDeletionTool;
window.insertionTool = Tool.insertionTool;
window.erasureTool = Tool.erasureTool;
window.proofMoveSingle = Tool.proofMoveSingle;
window.proofMoveMulti = Tool.proofMoveMulti;
window.iterationTool = Tool.iterationTool;
window.setTool = setTool;
window.setHighlight = setHighlight;
window.toggleHandler = toggleHandler;

declare global {
    interface Window {
        atomTool: Tool;
        cutTool: Tool;
        dragTool: Tool;
        saveMode: () => void;
        loadMode: () => void;
        moveSingleTool: Tool;
        moveMultiTool: Tool;
        copySingleTool: Tool;
        copyMultiTool: Tool;
        deleteSingleTool: Tool;
        deleteMultiTool: Tool;
        copyFromDrawTool: Tool;
        pasteInProofTool: Tool;
        resizeTool: Tool;
        doubleCutInsertionTool: Tool;
        doubleCutDeletionTool: Tool;
        insertionTool: Tool;
        erasureTool: Tool;
        proofMoveSingle: Tool;
        proofMoveMulti: Tool;
        iterationTool: Tool;
        setTool: (state: Tool) => void;
        setHighlight: (event: string, id: string) => void;
        toggleHandler: () => void;
    }
}

//Add no-highlight class only when mouse is pressed on a div to ensure that elements in the div are
//not highlighted any other time
function setHighlight(event: string, id: string) {
    const bar = document.getElementById(id);
    switch (event) {
        case "mousedown":
            bar?.classList.remove("no-highlight");
            break;
        case "mouseleave":
            bar?.classList.add("no-highlight");
            break;
    }
}

//Active mode button stays pressed down until another mode button is clicked
const toolButtons = document.querySelectorAll(".toolButton");
toolButtons.forEach(button => {
    button.addEventListener("click", () => {
        button.classList.add("toolButtonPressed");
        toolButtons.forEach(otherButton => {
            if (otherButton !== button) {
                otherButton.classList.remove("toolButtonPressed");
            }
        });
    });
});

export function setTool(state: Tool) {
    treeContext.toolState = state;
    cutTools.style.display = "none";
    atomTools.style.display = "none";
    treeString.style.display = "none";
    proofString.style.display = "none";
    selectionDisplay.style.display = "none";

    if (state <= 11) {
        treeContext.modeState = "Draw";
        treeString.style.display = "block";
    } else {
        treeContext.modeState = "Proof";
        proofString.style.display = "block";
    }

    switch (treeContext.toolState) {
        case Tool.atomTool:
            atomTools.style.display = "block";
            break;
        case Tool.cutTool:
            cutTools.style.display = "block";
            break;
        case Tool.copyFromDrawTool:
            selectionDisplay.style.display = "block";
            break;
        case Tool.doubleCutInsertionTool:
            cutTools.style.display = "block";
            break;
    }
}

/**
 * Calls the function to save the file.
 */
async function saveMode() {
    let name: string;
    let data: AEGTree | ProofNode[];

    if (treeContext.modeState === "Draw") {
        name = "AEG Tree";
        data = treeContext.tree;
    } else {
        name =
            treeContext.proofHistory[0].tree.toString() +
            // " - " +
            "\u2192" +
            treeContext.getLastProofStep().tree.toString();
        data = treeContext.proofHistory;
    }

    //Slow Download
    if ("showSaveFilePicker" in window) {
        const saveHandle = await window.showSaveFilePicker({
            excludeAcceptAllOption: true,
            suggestedName: name,
            startIn: "downloads",
            types: [
                {
                    description: "JSON Files",
                    accept: {
                        "text/json": [".json"],
                    },
                },
            ],
        });
        saveFile(saveHandle, data);
    } else {
        //Quick Download
        const f = document.createElement("a");
        f.href = JSON.stringify(data, null, "\t");
        f.download = name + ".json";
        f.click();
    }
}

/**
 * Calls the function to load the files.
 */
async function loadMode() {
    const [fileHandle] = await window.showOpenFilePicker({
        excludeAcceptAllOption: true,
        multiple: false,
        startIn: "downloads",
        types: [
            {
                description: "JSON Files",
                accept: {
                    "text/json": [".json"],
                },
            },
        ],
    });

    const file = await fileHandle.getFile();
    const reader = new FileReader();
    reader.addEventListener("load", () => {
        const aegData = reader.result;
        if (typeof aegData === "string") {
            const loadData = loadFile(treeContext.modeState, aegData);
            if (treeContext.modeState === "Draw") {
                treeContext.tree = loadData as AEGTree;
                redrawTree(treeContext.tree);
            } else if (treeContext.modeState === "Proof") {
                treeContext.proofHistory = loadData as ProofNode[];
                redrawProof();
            }
        } else {
            throw Error("Loading failed because reading the file was unsuccessful");
        }
    });
    reader.readAsText(file);
}

/**
 * Calls the respective keydown function depending on current mode.
 * @param event The event of a keypress
 */
function keyDownHandler(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === "s") {
        event.preventDefault(); //prevents Chrome and such from saving the .html of the current webpage
        saveMode();
    } else {
        switch (treeContext.toolState) {
            case Tool.atomTool:
                atomKeyPress(event);
                break;
        }
    }
}

/**
 * Calls the respective mouse down function depending on current mode.
 * @param event The mouse down event
 */
function mouseDownHandler(event: MouseEvent) {
    switch (treeContext.toolState) {
        case Tool.cutTool:
            cutMouseDown(event);
            break;
        case Tool.atomTool:
            atomMouseDown(event);
            break;
        case Tool.dragTool:
            dragMouseDown(event);
            break;
        case Tool.moveSingleTool:
            moveSingleMouseDown(event);
            break;
        case Tool.moveMultiTool:
            moveMultiMouseDown(event);
            break;
        case Tool.copySingleTool:
            copySingleMouseDown(event);
            break;
        case Tool.copyMultiTool:
            copyMultiMouseDown(event);
            break;
        case Tool.deleteSingleTool:
            deleteSingleMouseDown(event);
            break;
        case Tool.deleteMultiTool:
            deleteMultiMouseDown(event);
            break;
        case Tool.resizeTool:
            resizeMouseDown(event);
            break;
        case Tool.copyFromDrawTool:
            copyFromDrawMouseDown(event);
            break;
        case Tool.pasteInProofTool:
            pasteInProofMouseDown();
            break;
        case Tool.doubleCutInsertionTool:
            doubleCutInsertionMouseDown(event);
            break;
        case Tool.doubleCutDeletionTool:
            doubleCutDeletionMouseDown(event);
            break;
        case Tool.insertionTool:
            insertionMouseDown(event);
            break;
        case Tool.erasureTool:
            erasureMouseDown(event);
            break;
        case Tool.proofMoveSingle:
            proofMoveSingleMouseDown(event);
            break;
        case Tool.proofMoveMulti:
            proofMoveMultiMouseDown(event);
            break;
        case Tool.iterationTool:
            iterationMouseDown(event);
            break;
        default:
            break;
    }
    hasMouseDown = true;
}

/**
 * If mouse down has been used calls the respective mousedown function based on mode.
 * @param event the mouse move event
 */
function mouseMoveHandler(event: MouseEvent) {
    if (hasMouseDown && hasMouseIn) {
        switch (treeContext.toolState) {
            case Tool.cutTool:
                cutMouseMove(event);
                break;
            case Tool.atomTool:
                atomMouseMove(event);
                break;
            case Tool.dragTool:
                dragMouseMove(event);
                break;
            case Tool.moveSingleTool:
                moveSingleMouseMove(event);
                break;
            case Tool.moveMultiTool:
                moveMultiMouseMove(event);
                break;
            case Tool.copySingleTool:
                copySingleMouseMove(event);
                break;
            case Tool.copyMultiTool:
                copyMultiMouseMove(event);
                break;
            case Tool.deleteSingleTool:
                deleteSingleMouseMove(event);
                break;
            case Tool.deleteMultiTool:
                deleteMultiMouseMove(event);
                break;
            case Tool.resizeTool:
                resizeMouseMove(event);
                break;
            case Tool.copyFromDrawTool:
                copyFromDrawMouseMove(event);
                break;
            case Tool.pasteInProofTool:
                pasteInProofMouseMove();
                break;
            case Tool.doubleCutInsertionTool:
                doubleCutInsertionMouseMove(event);
                break;
            case Tool.doubleCutDeletionTool:
                doubleCutDeletionMouseMove(event);
                break;
            case Tool.insertionTool:
                insertionMouseMove(event);
                break;
            case Tool.erasureTool:
                erasureMouseMove(event);
                break;
            case Tool.proofMoveSingle:
                proofMoveSingleMouseMove(event);
                break;
            case Tool.proofMoveMulti:
                proofMoveMultiMouseMove(event);
                break;
            case Tool.iterationTool:
                iterationMouseMove(event);
                break;
            default:
                break;
        }
    }
}

/**
 * If mouse down has been used calls the respective mouse up function based on mode.
 * Resets mouse down after use.
 * @param event The mouse up event
 */
function mouseUpHandler(event: MouseEvent) {
    switch (treeContext.toolState) {
        case Tool.cutTool:
            cutMouseUp(event);
            break;
        case Tool.atomTool:
            atomMouseUp(event);
            break;
        case Tool.moveSingleTool:
            moveSingleMouseUp(event);
            break;
        case Tool.moveMultiTool:
            moveMultiMouseUp(event);
            break;
        case Tool.copySingleTool:
            copySingleMouseUp(event);
            break;
        case Tool.copyMultiTool:
            copyMultiMouseUp(event);
            break;
        case Tool.deleteSingleTool:
            deleteSingleMouseUp(event);
            break;
        case Tool.deleteMultiTool:
            deleteMultiMouseUp(event);
            break;
        case Tool.resizeTool:
            resizeMouseUp(event);
            break;
        case Tool.copyFromDrawTool:
            copyFromDrawMouseUp();
            break;
        case Tool.pasteInProofTool:
            pasteInProofMouseUp();
            break;
        case Tool.doubleCutInsertionTool:
            doubleCutInsertionMouseUp(event);
            break;
        case Tool.doubleCutDeletionTool:
            doubleCutDeletionMouseUp(event);
            break;
        case Tool.insertionTool:
            insertionMouseUp(event);
            break;
        case Tool.erasureTool:
            erasureMouseUp(event);
            break;
        case Tool.proofMoveSingle:
            proofMoveSingleMouseUp(event);
            break;
        case Tool.proofMoveMulti:
            proofMoveMultiMouseUp(event);
            break;
        case Tool.iterationTool:
            iterationMouseUp(event);
            break;
        default:
            break;
    }
    hasMouseDown = false;
}

/**
 * If mouse down has been used calls the respective mouse out function based on mode.
 * Resets mouse down after use.
 */
function mouseOutHandler() {
    switch (treeContext.toolState) {
        case Tool.cutTool:
            cutMouseOut();
            break;
        case Tool.atomTool:
            atomMouseOut();
            break;
        case Tool.dragTool:
            dragMosueOut();
            break;
        case Tool.moveSingleTool:
            moveSingleMouseOut();
            break;
        case Tool.moveMultiTool:
            moveMultiMouseOut();
            break;
        case Tool.copySingleTool:
            copySingleMouseOut();
            break;
        case Tool.copyMultiTool:
            copyMultiMouseOut();
            break;
        case Tool.deleteSingleTool:
            deleteSingleMouseOut();
            break;
        case Tool.deleteMultiTool:
            deleteMultiMouseOut();
            break;
        case Tool.resizeTool:
            resizeMouseOut();
            break;
        case Tool.copyFromDrawTool:
            copyFromDrawMouseOut();
            break;
        case Tool.pasteInProofTool:
            pasteInProofMouseOut();
            break;
        case Tool.doubleCutInsertionTool:
            doubleCutInsertionMouseOut();
            break;
        case Tool.doubleCutDeletionTool:
            doubleCutDeletionMouseOut();
            break;
        case Tool.insertionTool:
            insertionMouseOut();
            break;
        case Tool.erasureTool:
            erasureMouseOut();
            break;
        case Tool.proofMoveSingle:
            proofMoveSingleMouseOut();
            break;
        case Tool.proofMoveMulti:
            proofMoveMultiMouseOut();
            break;
        case Tool.iterationTool:
            iterationMouseOut();
            break;
        default:
            break;
    }
    hasMouseIn = false;
}

function mouseEnterHandler() {
    hasMouseIn = true;
}

/**
 * Resizes the canvas to the current width and height of the window
 */
function resizeHandler() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.onresize = resizeHandler;
