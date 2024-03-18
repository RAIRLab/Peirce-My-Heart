/**
 * @file Main application code. Sets up event listeners, context and window globals.
 *
 * @author Dawn Moore
 * @author James Oswald
 * @author Ryan R
 * @author Anusha Tiwari
 */

import {AEGTree} from "./AEG/AEGTree";
import {appendStep} from "./Proof/ProofHistory";
import {loadFile, saveFile} from "./AEG-IO";
import {ProofNode} from "./Proof/ProofNode";
import {redrawProof, redrawTree} from "./SharedToolUtils/DrawUtils";
import {toggleHandler} from "./ToggleModes";
import {Tool, TreeContext} from "./TreeContext";

import * as DrawClearTool from "./DrawTools/DrawClearTool";
import * as DragTool from "./SharedToolUtils/DragTool";
import * as AtomTool from "./DrawTools/AtomTool";
import * as CutTool from "./DrawTools/CutTool";
import * as DrawMoveSingleTool from "./DrawTools/DrawMoveSingleTool";
import * as DrawMoveMultiTool from "./DrawTools/DrawMoveMultiTool";
import * as CopySingleTool from "./DrawTools/CopySingleTool";
import * as CopyMultiTool from "./DrawTools/CopyMultiTool";
import * as DeleteSingleTool from "./DrawTools/DeleteSingleTool";
import * as DeleteMultiTool from "./DrawTools/DeleteMultiTool";
import * as DrawResizeTool from "./DrawTools/DrawResizeTool";
import * as CopyFromDraw from "./DrawTools/CopyFromDraw";

import * as ProofClearTool from "./ProofTools/ProofClearTool";

import * as DoubleCutInsertionTool from "./ProofTools/DoubleCutInsertionTool";
import * as DoubleCutDeletionTool from "./ProofTools/DoubleCutDeletionTool";
import * as ProofMoveSingleTool from "./ProofTools/ProofMoveSingleTool";
import * as ProofMoveMultiTool from "./ProofTools/ProofMoveMultiTool";
import * as IterationTool from "./ProofTools/IterationTool";
import * as DeiterationTool from "./ProofTools/DeiterationTool";
import * as InsertionTool from "./ProofTools/InsertionTool";
import * as ErasureTool from "./ProofTools/ErasureTool";
import * as ProofResizeTool from "./ProofTools/ProofResizeTool";
import * as PasteInProof from "./ProofTools/PasteInProof";

//Setting up canvas...
const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const res: CanvasRenderingContext2D | null = canvas.getContext("2d");
if (res === null) {
    throw Error("2d rendering context not supported");
}
const ctx: CanvasRenderingContext2D = res;
ctx.font = "35pt arial";

//Global states.
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

//True if the user's mouse is down. Assumed not to be down at the start.
let hasMouseDown = false;

//True if the user's mouse is down. Assumed to be in at the start.
let hasMouseIn = true;

//Global window exports.
//TODO: move these under the global import
window.tree = TreeContext.tree;
window.treeString = aegStringify(window.tree);
window.atomTool = Tool.atomTool;
window.cutTool = Tool.cutTool;
window.dragTool = Tool.dragTool;
window.aegStringify = aegStringify;
window.saveMode = saveMode;
window.loadMode = loadMode;
window.drawMoveSingleTool = Tool.drawMoveSingleTool;
window.drawMoveMultiTool = Tool.drawMoveMultiTool;
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
window.proofClearTool = Tool.proofClearTool;
window.drawClearTool = Tool.drawClearTool;
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
        drawMoveSingleTool: Tool;
        drawMoveMultiTool: Tool;
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
        proofClearTool: Tool;
        drawClearTool: Tool;
        setTool: (state: Tool) => void;
        setHighlight: (event: string, id: string) => void;
        toggleHandler: () => void;
    }
}

//Add no-highlight class only when mouse is pressed on a div to ensure that elements in the div are
//not highlighted any other time
function setHighlight(event: string, id: string): void {
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

//Current tool button stays active until another tool button is clicked.
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
 * Updates TreeContext and the HTML display elements according to the incoming Tool.
 *
 * @param state Incoming Tool.
 */
function setTool(state: Tool): void {
    TreeContext.toolState = state;
    cutTools.style.display = "none";
    atomTools.style.display = "none";
    selectionDisplay.style.display = "none";

    switch (TreeContext.toolState) {
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
 *
 * @param treeData Incoming data.
 * @returns Stringification of treeData.
 */
export function aegStringify(treeData: AEGTree | ProofNode[]): string {
    return JSON.stringify(treeData, null, "\t");
}

/**
 * Calls appropriate methods to save the current AEGTree as a file.
 */
async function saveMode() {
    let name: string;
    let data: AEGTree | ProofNode[];

    if (TreeContext.modeState === "Draw") {
        name = "AEG Tree";
        data = TreeContext.tree;
    } else {
        if (TreeContext.proof.length === 0) {
            name = "[] \u2192 []";
        } else {
            name =
                TreeContext.proof[0].tree.toString() +
                "\u2192" +
                TreeContext.getLastProofStep().tree.toString();
        }
        data = TreeContext.proof;
    }

    //Errors caused by file handler or HTML download element should not be displayed.
    try {
        //Slow Download...
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
            //Quick Download...
            const f = document.createElement("a");
            f.href = aegStringify(data);
            f.download = name + ".json";
            f.click();
        }
    } catch (error) {
        //Catch error but do nothing. Discussed in Issue #247.
    }
}

/**
 * Calls the appropriate methods to load files and convert them to equivalent AEGTrees.
 */
async function loadMode(): Promise<void> {
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
                const loadData = loadFile(TreeContext.modeState, aegData);
                if (TreeContext.modeState === "Draw") {
                    //Loads data.
                    TreeContext.tree = loadData as AEGTree;
                    //Redraws tree which is now the parsed loadData.
                    redrawTree(TreeContext.tree);
                } else if (TreeContext.modeState === "Proof") {
                    //Clears current proof.
                    TreeContext.clearProof();
                    //Loads data for the new proof.
                    TreeContext.proof = loadData as ProofNode[];
                    //Removes default start step.
                    document.getElementById("Row: 1")?.remove();
                    //Adds button for each step of the loaded proof to the history bar.
                    for (let i = 0; i < TreeContext.proof.length; i++) {
                        appendStep(TreeContext.proof[i], i + 1);
                    }
                    TreeContext.currentProofStep = TreeContext.proof[TreeContext.proof.length - 1];
                    redrawProof();
                }
            } else {
                console.log("Loading failed because reading the file was unsuccessful.");
            }
        });
        reader.readAsText(file);
    } catch (error) {
        //Do nothing.
    }
}

async function handleUndo(): Promise<void> {
    TreeContext.undoDrawStep();
}

async function handleRedo(): Promise<void> {
    TreeContext.redoDrawStep();
}

//TODO: replace all of this with polymorphism -James

/**
 * Calls appropriate keydown method with the incoming KeyboardEvent.
 *
 * @param event Incoming KeyboardEvent.
 */
function keyDownHandler(event: KeyboardEvent): void {
    if (event.ctrlKey) {
        event.preventDefault(); //Prevents Chrome from saving a .html of the current webpage.
        if (event.key === "s") {
            saveMode();
        } else if (event.key === "z") {
            handleUndo();
        } else if (event.key === "y") {
            handleRedo();
        }
    } else {
        switch (TreeContext.toolState) {
            case Tool.atomTool:
                AtomTool.atomKeyPress(event);
                break;
        }
    }
}

/**
 * Calls appropriate mouseenter handler method depending on tool state.
 */
function mouseEnterHandler(): void {
    switch (TreeContext.toolState) {
        case Tool.cutTool:
            CutTool.cutMouseEnter();
            break;
        case Tool.dragTool:
            DragTool.dragMouseEnter();
            break;
        case Tool.doubleCutInsertionTool:
            DoubleCutInsertionTool.doubleCutInsertionMouseEnter();
            break;
        default:
            break;
    }
    hasMouseIn = true;
}

/**
 * Calls appropriate mousedown handler method, depending on tool state,
 * with the incoming MouseEvent.
 *
 * @param event Incoming MouseEvent.
 */
function mouseDownHandler(event: MouseEvent): void {
    if (event.button === 0) {
        switch (TreeContext.toolState) {
            case Tool.cutTool:
                CutTool.cutMouseDown(event);
                break;
            case Tool.atomTool:
                AtomTool.atomMouseDown(event);
                break;
            case Tool.dragTool:
                DragTool.dragMouseDown(event);
                break;
            case Tool.drawMoveSingleTool:
                DrawMoveSingleTool.drawMoveSingleMouseDown(event);
                break;
            case Tool.drawMoveMultiTool:
                DrawMoveMultiTool.drawMoveMultiMouseDown(event);
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
                DrawResizeTool.drawResizeMouseDown(event);
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
            case Tool.proofClearTool:
                ProofClearTool.proofClearMouseDown();
                break;
            case Tool.drawClearTool:
                DrawClearTool.drawClearMouseDown();
                break;
            default:
                break;
        }
        hasMouseDown = true;
    }
}

/**
 * Calls appropriate mousemove handler method, depending on tool state,
 * with the incoming MouseEvent.
 *
 * @param event Incoming MouseEvent.
 */
function mouseMoveHandler(event: MouseEvent): void {
    if (hasMouseDown && hasMouseIn) {
        switch (TreeContext.toolState) {
            case Tool.cutTool:
                CutTool.cutMouseMove(event);
                break;
            case Tool.atomTool:
                AtomTool.atomMouseMove(event);
                break;
            case Tool.dragTool:
                DragTool.dragMouseMove(event);
                break;
            case Tool.drawMoveSingleTool:
                DrawMoveSingleTool.drawMoveSingleMouseMove(event);
                break;
            case Tool.drawMoveMultiTool:
                DrawMoveMultiTool.drawMoveMultiMouseMove(event);
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
                DrawResizeTool.drawResizeMouseMove(event);
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
 * Calls appropriate mouseup handler method, depending on tool state,
 * with the incoming MouseEvent.
 *
 * @param event Incoming MouseEvent.
 */
function mouseUpHandler(event: MouseEvent): void {
    if (event.button === 0) {
        switch (TreeContext.toolState) {
            case Tool.cutTool:
                CutTool.cutMouseUp(event);
                break;
            case Tool.atomTool:
                AtomTool.atomMouseUp(event);
                break;
            case Tool.dragTool:
                DragTool.dragMouseUp();
                break;
            case Tool.drawMoveSingleTool:
                DrawMoveSingleTool.drawMoveSingleMouseUp(event);
                break;
            case Tool.drawMoveMultiTool:
                DrawMoveMultiTool.drawMoveMultiMouseUp(event);
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
                DrawResizeTool.drawResizeMouseUp(event);
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
            case Tool.proofClearTool:
                ProofClearTool.proofClearMouseUp();
                break;
            case Tool.drawClearTool:
                DrawClearTool.drawClearMouseUp();
                break;
            default:
                break;
        }
        hasMouseDown = false;
    }
}

/**
 * Calls appropriate mouseout handler method depending on tool state.
 */
function mouseOutHandler(): void {
    switch (TreeContext.toolState) {
        case Tool.cutTool:
            CutTool.cutMouseOut();
            break;
        case Tool.atomTool:
            AtomTool.atomMouseOut();
            break;
        case Tool.dragTool:
            DragTool.dragMouseOut();
            break;
        case Tool.drawMoveSingleTool:
            DrawMoveSingleTool.drawMoveSingleMouseOut();
            break;
        case Tool.drawMoveMultiTool:
            DrawMoveMultiTool.drawMoveMultiMouseOut();
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
            DrawResizeTool.drawResizeMouseOut();
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
        case Tool.proofClearTool:
            ProofClearTool.proofClearMouseOut();
            break;
        case Tool.drawClearTool:
            DrawClearTool.drawClearMouseOut();
            break;
        default:
            break;
    }
    hasMouseIn = false;
}

/**
 * Changes the canvas' width and height according to the window's on window resize.
 */
function resizeHandler(): void {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.onresize = resizeHandler;
