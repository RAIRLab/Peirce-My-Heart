/**
 * A program to draw ellipses and atoms.
 * @author Dawn Moore
 * @author James Oswald
 * @author Anusha Tiwari
 */

import {AEGTree} from "./AEG/AEGTree";
import {Tool, treeContext} from "./treeContext";
import {saveFile, loadFile} from "./AEG-IO";
import {redrawProof, redrawTree} from "./SharedToolUtils/DrawUtils";
import {toggleHandler} from "./ToggleModes";
import {ProofNode} from "./AEG/ProofNode";

import * as CutTool from "./DrawTools/CutTool";
import * as AtomTool from "./DrawTools/AtomTool";

import * as DragTool from "./SharedToolUtils/DragTool";
import * as MoveSingleTool from "./DrawTools/MoveSingleTool";
import * as MoveMultiTool from "./DrawTools/MoveMultiTool";
import * as CopySingleTool from "./DrawTools/CopySingleTool";
import * as CopyMultiTool from "./DrawTools/CopyMultiTool";
import * as DeleteSingleTool from "./DrawTools/DeleteSingleTool";
import * as DeleteMultiTool from "./DrawTools/DeleteMultiTool";
import * as CopyFromDraw from "./DrawTools/CopyFromDraw";

import * as DoubleCutInsertionTool from "./ProofTools/DoubleCutInsertionTool";
import * as DoubleCutDeletionTool from "./ProofTools/DoubleCutDeletionTool";
import * as InsertionTool from "./ProofTools/InsertionTools";
import * as ErasureTool from "./ProofTools/ErasureTool";
import * as ResizeTool from "./DrawTools/ResizeTool";
import * as ProofMoveSingleTool from "./ProofTools/ProofMoveSingleTool";
import * as ProofMoveMultiTool from "./ProofTools/ProofMoveMultiTool";

import * as PasteInProof from "./ProofTools/PasteInProof";
import * as IterationTool from "./ProofTools/IterationTool";
import * as ProofResizeTool from "./ProofTools/ProofResizeTool";
import * as DeiterationTool from "./ProofTools/DeiterationTool";
import * as ClearProofTool from "./ProofTools/ClearProofTool";
import {appendStep} from "./ProofHistory";

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
window.tree = treeContext.tree;
window.treeString = aegStringify(window.tree);
window.atomTool = Tool.atomTool;
window.cutTool = Tool.cutTool;
window.dragTool = Tool.dragTool;
window.aegStringify = aegStringify;
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
window.proofMoveSingleTool = Tool.proofMoveSingleTool;
window.proofMoveMultiTool = Tool.proofMoveMultiTool;
window.proofResizeTool = Tool.proofResizeTool;
window.iterationTool = Tool.iterationTool;
window.deiterationTool = Tool.deiterationTool;
window.clearProofTool = Tool.clearProofTool;
window.setTool = setTool;
window.setHighlight = setHighlight;
window.toggleHandler = toggleHandler;

declare global {
    interface Window {
        tree: AEGTree;
        treeString: string;
        atomTool: Tool;
        cutTool: Tool;
        dragTool: Tool;
        saveMode: () => void;
        loadMode: () => void;
        aegStringify: (treeData: AEGTree | ProofNode[]) => string;
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
        proofMoveSingleTool: Tool;
        proofMoveMultiTool: Tool;
        proofResizeTool: Tool;
        iterationTool: Tool;
        deiterationTool: Tool;
        clearProofTool: Tool;
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

/**
 * Updates our global tree content tool and the html display elements according to the tool button
 * that was clicked on
 * @param state The tool that was clicked on
 */
function setTool(state: Tool) {
    treeContext.toolState = state;
    cutTools.style.display = "none";
    atomTools.style.display = "none";
    selectionDisplay.style.display = "none";

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
 * Creates and returns the stringification of the incoming data. Uses tab characters as delimiters.
 * @param treeData the incoming data
 * @returns the stringification of the incoming data
 */
export function aegStringify(treeData: AEGTree | ProofNode[]): string {
    return JSON.stringify(treeData, null, "\t");
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
        if (treeContext.proof.length === 0) {
            name = "[] \u2192 []";
        } else {
            name =
                treeContext.proof[0].tree.toString() +
                "\u2192" +
                treeContext.getLastProofStep().tree.toString();
        }
        data = treeContext.proof;
    }

    //Errors caused due to file handler or html download element should not be displayed
    try {
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
            f.href = aegStringify(data);
            f.download = name + ".json";
            f.click();
        }
    } catch (error) {
        //Catch error but do nothing
    }
}

/**
 * Calls the function to load the files.
 */
async function loadMode() {
    try {
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
                    //Load in the data of our new tree
                    treeContext.tree = loadData as AEGTree;
                    //Redraw our tree
                    redrawTree(treeContext.tree);
                } else if (treeContext.modeState === "Proof") {
                    //Clear our current proof
                    treeContext.clearProof();
                    //Load in the data of the new proof
                    treeContext.proof = loadData as ProofNode[];
                    //Remove our default start step
                    document.getElementById("Row: 1")?.remove();
                    //Add a button for each step of the proof to the history bar
                    for (let i = 0; i < treeContext.proof.length; i++) {
                        appendStep(treeContext.proof[i], i + 1);
                    }
                    treeContext.currentProofStep = treeContext.proof[treeContext.proof.length - 1];
                    //Redraw our proof
                    redrawProof();
                }
            } else {
                console.log("Loading failed because reading the file was unsuccessful");
            }
        });
        reader.readAsText(file);
    } catch (error) {
        //Do nothing
    }
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
                AtomTool.atomKeyPress(event);
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
            CutTool.cutMouseDown(event);
            break;
        case Tool.atomTool:
            AtomTool.atomMouseDown(event);
            break;
        case Tool.dragTool:
            DragTool.dragMouseDown(event);
            break;
        case Tool.moveSingleTool:
            MoveSingleTool.moveSingleMouseDown(event);
            break;
        case Tool.moveMultiTool:
            MoveMultiTool.moveMultiMouseDown(event);
            break;
        case Tool.copySingleTool:
            CopySingleTool.copySingleMouseDown(event);
            break;
        case Tool.copyMultiTool:
            CopyMultiTool.copyMultiMouseDown(event);
            break;
        case Tool.deleteSingleTool:
            DeleteSingleTool.deleteSingleMouseDown(event);
            break;
        case Tool.deleteMultiTool:
            DeleteMultiTool.deleteMultiMouseDown(event);
            break;
        case Tool.resizeTool:
            ResizeTool.resizeMouseDown(event);
            break;
        case Tool.copyFromDrawTool:
            CopyFromDraw.copyFromDrawMouseDown(event);
            break;
        case Tool.pasteInProofTool:
            PasteInProof.pasteInProofMouseDown();
            break;
        case Tool.doubleCutInsertionTool:
            DoubleCutInsertionTool.doubleCutInsertionMouseDown(event);
            break;
        case Tool.doubleCutDeletionTool:
            DoubleCutDeletionTool.doubleCutDeletionMouseDown(event);
            break;
        case Tool.insertionTool:
            InsertionTool.insertionMouseDown(event);
            break;
        case Tool.erasureTool:
            ErasureTool.erasureMouseDown(event);
            break;
        case Tool.proofMoveSingleTool:
            ProofMoveSingleTool.proofMoveSingleMouseDown(event);
            break;
        case Tool.proofMoveMultiTool:
            ProofMoveMultiTool.proofMoveMultiMouseDown(event);
            break;
        case Tool.proofResizeTool:
            ProofResizeTool.proofResizeMouseDown(event);
            break;
        case Tool.iterationTool:
            IterationTool.iterationMouseDown(event);
            break;
        case Tool.deiterationTool:
            DeiterationTool.deiterationMouseDown(event);
            break;
        case Tool.clearProofTool:
            ClearProofTool.clearProofMouseDown();
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
                CutTool.cutMouseMove(event);
                break;
            case Tool.atomTool:
                AtomTool.atomMouseMove(event);
                break;
            case Tool.dragTool:
                DragTool.dragMouseMove(event);
                break;
            case Tool.moveSingleTool:
                MoveSingleTool.moveSingleMouseMove(event);
                break;
            case Tool.moveMultiTool:
                MoveMultiTool.moveMultiMouseMove(event);
                break;
            case Tool.copySingleTool:
                CopySingleTool.copySingleMouseMove(event);
                break;
            case Tool.copyMultiTool:
                CopyMultiTool.copyMultiMouseMove(event);
                break;
            case Tool.deleteSingleTool:
                DeleteSingleTool.deleteSingleMouseMove(event);
                break;
            case Tool.deleteMultiTool:
                DeleteMultiTool.deleteMultiMouseMove(event);
                break;
            case Tool.resizeTool:
                ResizeTool.resizeMouseMove(event);
                break;
            case Tool.copyFromDrawTool:
                CopyFromDraw.copyFromDrawMouseMove(event);
                break;
            case Tool.pasteInProofTool:
                PasteInProof.pasteInProofMouseMove();
                break;
            case Tool.doubleCutInsertionTool:
                DoubleCutInsertionTool.doubleCutInsertionMouseMove(event);
                break;
            case Tool.doubleCutDeletionTool:
                DoubleCutDeletionTool.doubleCutDeletionMouseMove(event);
                break;
            case Tool.insertionTool:
                InsertionTool.insertionMouseMove(event);
                break;
            case Tool.erasureTool:
                ErasureTool.erasureMouseMove(event);
                break;
            case Tool.proofMoveSingleTool:
                ProofMoveSingleTool.proofMoveSingleMouseMove(event);
                break;
            case Tool.proofMoveMultiTool:
                ProofMoveMultiTool.proofMoveMultiMouseMove(event);
                break;
            case Tool.proofResizeTool:
                ProofResizeTool.proofResizeMouseMove(event);
                break;
            case Tool.iterationTool:
                IterationTool.iterationMouseMove(event);
                break;
            case Tool.deiterationTool:
                DeiterationTool.deiterationMouseMove(event);
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
            CutTool.cutMouseUp(event);
            break;
        case Tool.atomTool:
            AtomTool.atomMouseUp(event);
            break;
        case Tool.moveSingleTool:
            MoveSingleTool.moveSingleMouseUp(event);
            break;
        case Tool.moveMultiTool:
            MoveMultiTool.moveMultiMouseUp(event);
            break;
        case Tool.copySingleTool:
            CopySingleTool.copySingleMouseUp(event);
            break;
        case Tool.copyMultiTool:
            CopyMultiTool.copyMultiMouseUp(event);
            break;
        case Tool.deleteSingleTool:
            DeleteSingleTool.deleteSingleMouseUp(event);
            break;
        case Tool.deleteMultiTool:
            DeleteMultiTool.deleteMultiMouseUp(event);
            break;
        case Tool.resizeTool:
            ResizeTool.resizeMouseUp(event);
            break;
        case Tool.copyFromDrawTool:
            CopyFromDraw.copyFromDrawMouseUp();
            break;
        case Tool.pasteInProofTool:
            PasteInProof.pasteInProofMouseUp();
            break;
        case Tool.doubleCutInsertionTool:
            DoubleCutInsertionTool.doubleCutInsertionMouseUp(event);
            break;
        case Tool.doubleCutDeletionTool:
            DoubleCutDeletionTool.doubleCutDeletionMouseUp(event);
            break;
        case Tool.insertionTool:
            InsertionTool.insertionMouseUp(event);
            break;
        case Tool.erasureTool:
            ErasureTool.erasureMouseUp(event);
            break;
        case Tool.proofMoveSingleTool:
            ProofMoveSingleTool.proofMoveSingleMouseUp(event);
            break;
        case Tool.proofMoveMultiTool:
            ProofMoveMultiTool.proofMoveMultiMouseUp(event);
            break;
        case Tool.proofResizeTool:
            ProofResizeTool.proofResizeMouseUp(event);
            break;
        case Tool.iterationTool:
            IterationTool.iterationMouseUp(event);
            break;
        case Tool.deiterationTool:
            DeiterationTool.deiterationMouseUp(event);
            break;
        case Tool.clearProofTool:
            ClearProofTool.clearProofMouseUp();
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
            CutTool.cutMouseOut();
            break;
        case Tool.atomTool:
            AtomTool.atomMouseOut();
            break;
        case Tool.dragTool:
            DragTool.dragMouseOut();
            break;
        case Tool.moveSingleTool:
            MoveSingleTool.moveSingleMouseOut();
            break;
        case Tool.moveMultiTool:
            MoveMultiTool.moveMultiMouseOut();
            break;
        case Tool.copySingleTool:
            CopySingleTool.copySingleMouseOut();
            break;
        case Tool.copyMultiTool:
            CopyMultiTool.copyMultiMouseOut();
            break;
        case Tool.deleteSingleTool:
            DeleteSingleTool.deleteSingleMouseOut();
            break;
        case Tool.deleteMultiTool:
            DeleteMultiTool.deleteMultiMouseOut();
            break;
        case Tool.resizeTool:
            ResizeTool.resizeMouseOut();
            break;
        case Tool.copyFromDrawTool:
            CopyFromDraw.copyFromDrawMouseOut();
            break;
        case Tool.pasteInProofTool:
            PasteInProof.pasteInProofMouseOut();
            break;
        case Tool.doubleCutInsertionTool:
            DoubleCutInsertionTool.doubleCutInsertionMouseOut();
            break;
        case Tool.doubleCutDeletionTool:
            DoubleCutDeletionTool.doubleCutDeletionMouseOut();
            break;
        case Tool.insertionTool:
            InsertionTool.insertionMouseOut();
            break;
        case Tool.erasureTool:
            ErasureTool.erasureMouseOut();
            break;
        case Tool.proofMoveSingleTool:
            ProofMoveSingleTool.proofMoveSingleMouseOut();
            break;
        case Tool.proofMoveMultiTool:
            ProofMoveMultiTool.proofMoveMultiMouseOut();
            break;
        case Tool.proofResizeTool:
            ProofResizeTool.proofResizeMouseOut();
            break;
        case Tool.iterationTool:
            IterationTool.iterationMouseOut();
            break;
        case Tool.deiterationTool:
            DeiterationTool.deiterationMouseOut();
            break;
        case Tool.clearProofTool:
            ClearProofTool.clearProofMouseOut();
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
