/**
 * A program to draw ellipses and atoms.
 * @author Dawn Moore
 * @author James Oswald
 * @author Anusha Tiwari
 */

import {AEGTree} from "./AEG/AEGTree";
import {Tool, treeContext} from "./treeContext";
import {cutMouseDown, cutMouseMove, cutMouseOut, cutMouseUp} from "./DrawModes/CutMode";
import {
    atomKeyPress,
    atomMouseDown,
    atomMouseMove,
    atomMouseUp,
    atomMouseOut,
} from "./DrawModes/AtomMode";
import {saveFile, loadFile} from "./AEG-IO";
import {redrawTree} from "./DrawModes/DrawUtils";
import {dragMosueOut, dragMouseDown, dragMouseMove} from "./DrawModes/DragMode";
import {
    moveSingleMouseDown,
    moveSingleMouseMove,
    moveSingleMouseUp,
    moveSingleMouseOut,
} from "./DrawModes/MoveSingleMode";
import {
    moveMultiMouseDown,
    moveMultiMouseMove,
    moveMultiMouseUp,
    moveMultiMouseOut,
} from "./DrawModes/MoveMultiMode";
import {
    copySingleMouseDown,
    copySingleMouseMove,
    copySingleMouseUp,
    copySingleMouseOut,
} from "./DrawModes/CopySingleMode";
import {
    copyMultiMouseDown,
    copyMultiMouseMove,
    copyMultiMouseUp,
    copyMultiMouseOut,
} from "./DrawModes/CopyMultiMode";
import {
    deleteSingleMouseDown,
    deleteSingleMouseMove,
    deleteSingleMouseOut,
    deleteSingleMouseUp,
} from "./DrawModes/DeleteSingleMode";

import {
    deleteMultiMouseDown,
    deleteMultiMouseMove,
    deleteMultiMouseOut,
    deleteMultiMouseUp,
} from "./DrawModes/DeleteMultiMode";
import {
    toProofMouseDown,
    toProofMouseMove,
    toProofMouseUp,
    toProofMouseOut,
} from "./DrawModes/ToProofMode";
import {
    doubleCutInsertionMouseDown,
    doubleCutInsertionMouseMove,
    doubleCutInsertionMouseUp,
    doubleCutInsertionMouseOut,
} from "./ProofTools/DoubleCutInsertionTool";
import {toggleHandler} from "./ToggleModes";

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
window.atomMode = Tool.atomMode;
window.cutMode = Tool.cutMode;
window.dragMode = Tool.dragMode;
window.saveMode = saveMode;
window.loadMode = loadMode;
window.moveSingleMode = Tool.moveSingleMode;
window.moveMultiMode = Tool.moveMultiMode;
window.copySingleMode = Tool.copySingleMode;
window.copyMultiMode = Tool.copyMultiMode;
window.deleteSingleMode = Tool.deleteSingleMode;
window.deleteMultiMode = Tool.deleteMultiMode;
window.toProofMode = Tool.toProofMode;
window.doubleCutInsertionTool = Tool.doubleCutInsertionTool;
window.setMode = setMode;
window.setHighlight = setHighlight;
window.toggleHandler = toggleHandler;

declare global {
    interface Window {
        atomMode: Tool;
        cutMode: Tool;
        dragMode: Tool;
        saveMode: () => void;
        loadMode: () => void;
        moveSingleMode: Tool;
        moveMultiMode: Tool;
        copySingleMode: Tool;
        copyMultiMode: Tool;
        deleteSingleMode: Tool;
        deleteMultiMode: Tool;
        toProofMode: Tool;
        doubleCutInsertionTool: Tool;
        setMode: (state: Tool) => void;
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
const modeButtons = document.querySelectorAll(".modeButton");
modeButtons.forEach(button => {
    button.addEventListener("click", () => {
        button.classList.toggle("modeButtonPressed");
        modeButtons.forEach(otherButton => {
            if (otherButton !== button) {
                otherButton.classList.remove("modeButtonPressed");
            }
        });
    });
});

export function setMode(state: Tool) {
    treeContext.toolState = state;
    cutTools.style.display = "none";
    atomTools.style.display = "none";

    switch (treeContext.toolState) {
        case Tool.atomMode:
            atomTools.style.display = "block";
            break;
        case Tool.cutMode:
            cutTools.style.display = "block";
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
    if ("showSaveFilePicker" in window) {
        //Slow Download
        const saveHandle = await window.showSaveFilePicker({
            excludeAcceptAllOption: true,
            suggestedName: "AEG Tree",
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
        saveFile(saveHandle, treeContext.tree);
    } else {
        //Quick Download
        const f = document.createElement("a");
        f.href = JSON.stringify(treeContext.tree, null, "\t");
        f.download = "AEGTree.json";
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
        const loadData = loadFile(aegData);
        if (loadData instanceof AEGTree) {
            treeContext.tree = loadData;
            redrawTree(treeContext.tree);
        }
        //TODO: else popup error
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
            case Tool.atomMode:
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
        case Tool.cutMode:
            cutMouseDown(event);
            break;
        case Tool.atomMode:
            atomMouseDown(event);
            break;
        case Tool.dragMode:
            dragMouseDown(event);
            break;
        case Tool.moveSingleMode:
            moveSingleMouseDown(event);
            break;
        case Tool.moveMultiMode:
            moveMultiMouseDown(event);
            break;
        case Tool.copySingleMode:
            copySingleMouseDown(event);
            break;
        case Tool.copyMultiMode:
            copyMultiMouseDown(event);
            break;
        case Tool.deleteSingleMode:
            deleteSingleMouseDown(event);
            break;
        case Tool.deleteMultiMode:
            deleteMultiMouseDown(event);
            break;
        case Tool.toProofMode:
            toProofMouseDown(event);
            break;
        case Tool.doubleCutInsertionTool:
            doubleCutInsertionMouseDown(event);
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
            case Tool.cutMode:
                cutMouseMove(event);
                break;
            case Tool.atomMode:
                atomMouseMove(event);
                break;
            case Tool.dragMode:
                dragMouseMove(event);
                break;
            case Tool.moveSingleMode:
                moveSingleMouseMove(event);
                break;
            case Tool.moveMultiMode:
                moveMultiMouseMove(event);
                break;
            case Tool.copySingleMode:
                copySingleMouseMove(event);
                break;
            case Tool.copyMultiMode:
                copyMultiMouseMove(event);
                break;
            case Tool.deleteSingleMode:
                deleteSingleMouseMove(event);
                break;
            case Tool.deleteMultiMode:
                deleteMultiMouseMove(event);
                break;
            case Tool.toProofMode:
                toProofMouseMove();
                break;
            case Tool.doubleCutInsertionTool:
                doubleCutInsertionMouseMove(event);
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
        case Tool.cutMode:
            cutMouseUp(event);
            break;
        case Tool.atomMode:
            atomMouseUp(event);
            break;
        case Tool.moveSingleMode:
            moveSingleMouseUp(event);
            break;
        case Tool.moveMultiMode:
            moveMultiMouseUp(event);
            break;
        case Tool.copySingleMode:
            copySingleMouseUp(event);
            break;
        case Tool.copyMultiMode:
            copyMultiMouseUp(event);
            break;
        case Tool.deleteSingleMode:
            deleteSingleMouseUp(event);
            break;
        case Tool.deleteMultiMode:
            deleteMultiMouseUp(event);
            break;
        case Tool.toProofMode:
            toProofMouseUp();
            break;
        case Tool.doubleCutInsertionTool:
            doubleCutInsertionMouseUp(event);
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
        case Tool.cutMode:
            cutMouseOut();
            break;
        case Tool.atomMode:
            atomMouseOut();
            break;
        case Tool.dragMode:
            dragMosueOut();
            break;
        case Tool.moveSingleMode:
            moveSingleMouseOut();
            break;
        case Tool.moveMultiMode:
            moveMultiMouseOut();
            break;
        case Tool.copySingleMode:
            copySingleMouseOut();
            break;
        case Tool.copyMultiMode:
            copyMultiMouseOut();
            break;
        case Tool.deleteSingleMode:
            deleteSingleMouseOut();
            break;
        case Tool.deleteMultiMode:
            deleteMultiMouseOut();
            break;
        case Tool.toProofMode:
            toProofMouseOut();
            break;
        case Tool.doubleCutInsertionTool:
            doubleCutInsertionMouseOut();
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
