/**
 * A program to draw ellipses and atoms.
 * @author Dawn Moore
 * @author James Oswald
 * @author Anusha Tiwari
 */

import {AEGTree} from "./AEG/AEGTree";
import {CutNode} from "./AEG/CutNode";
import {Ellipse} from "./AEG/Ellipse";
import {AtomNode} from "./AEG/AtomNode";
import {Point} from "./AEG/Point";
import {cutMouseDown, cutMouseMove, cutMouseOut, cutMouseUp} from "./CutMode";
import {atomKeyPress, atomMouseDown, atomMouseMove, atomMouseUp, atomMouseOut} from "./AtomMode";
import {drawAtom} from "./AtomMode";
import {saveFile, loadFile} from "./AEG-IO";
import {dragMosueOut, dragMouseDown, dragMouseMove, offset} from "./DragMode";

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
const cutDisplay = <HTMLParagraphElement>document.getElementById("graphString");
const cutTools = <HTMLParagraphElement>document.getElementById("cutTools");
const atomTools = <HTMLParagraphElement>document.getElementById("atomTools");
window.addEventListener("keydown", keyDownHandler);
canvas.addEventListener("mousedown", mouseDownHandler);
canvas.addEventListener("mousemove", mouseMoveHandler);
canvas.addEventListener("mouseup", mouseUpHandler);
canvas.addEventListener("mouseout", mouseOutHandler);
canvas.addEventListener("mouseenter", mouseEnterHandler);
enum Mode {
    atomMode,
    cutMode,
    dragMode,
    moveSingleMode,
    moveMultiMode,
    copySingleMode,
    copyMultiMode,
    deleteSingleMode,
    deleteMultiMode,
}
let modeState: Mode;
let hasMouseDown = false;
let hasMouseIn = true;
export let tree: AEGTree = new AEGTree();

//Window Exports
window.atomMode = atomMode;
window.cutMode = cutMode;
window.dragMode = dragMode;
window.saveMode = saveMode;
window.loadMode = loadMode;
window.moveSingleMode = moveSingleMode;
window.moveMultiMode = moveMultiMode;
window.copySingleMode = copySingleMode;
window.copyMultiMode = copyMultiMode;
window.deleteSingleMode = deleteSingleMode;
window.deleteMultiMode = deleteMultiMode;
declare global {
    interface Window {
        cutMode: () => void;
        atomMode: () => void;
        dragMode: () => void;
        saveMode: () => void;
        loadMode: () => void;
        moveSingleMode: () => void;
        moveMultiMode: () => void;
        copySingleMode: () => void;
        copyMultiMode: () => void;
        deleteSingleMode: () => void;
        deleteMultiMode: () => void;
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

/**
 * Sets the current mode to cut mode. Hides non cutTools.f
 */
function cutMode() {
    modeState = Mode.cutMode;
    cutTools.style.display = "block";
    //Block all other mode tools
    atomTools.style.display = "none";
}

/**
 * Sets the current mode to atom mode. Hides non atom tools.
 */
function atomMode() {
    modeState = Mode.atomMode;
    atomTools.style.display = "block";
    //Block all other mode tools
    cutTools.style.display = "none";
}

/**
 * Sets the current mode to move mode. Hides non move tools.
 */
function dragMode() {
    modeState = Mode.dragMode;
    cutTools.style.display = "none";
    atomTools.style.display = "none";
}

/**
 * Sets the current mode to moveSingleMode. Hides non move tools.
 */
function moveSingleMode() {
    modeState = Mode.moveSingleMode;
    cutTools.style.display = "none";
    atomTools.style.display = "none";
}

/**
 * Sets the current mode to moveMultiMode. Hides non move tools.
 */
function moveMultiMode() {
    modeState = Mode.moveMultiMode;
    cutTools.style.display = "none";
    atomTools.style.display = "none";
}

/**
 * Sets the current mode to copySingleMode. Hides non copy tools.
 */
function copySingleMode() {
    modeState = Mode.copySingleMode;
    cutTools.style.display = "none";
    atomTools.style.display = "none";
}

/**
 * Sets the current mode to copyMultiMode. Hides non copy tools.
 */
function copyMultiMode() {
    modeState = Mode.copyMultiMode;
    cutTools.style.display = "none";
    atomTools.style.display = "none";
}

/**
 * Sets the current mode to deleteSingleMode. Hides non delete tools.
 */
function deleteSingleMode() {
    modeState = Mode.deleteSingleMode;
    cutTools.style.display = "none";
    atomTools.style.display = "none";
}

/**
 * Sets the current mode to deleteMultiMode. Hides non delete tools.
 */
function deleteMultiMode() {
    modeState = Mode.deleteMultiMode;
    cutTools.style.display = "none";
    atomTools.style.display = "none";
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

        saveFile(saveHandle, tree);
    } else {
        //Quick Download
        const f = document.createElement("a");
        f.href = JSON.stringify(tree, null, "\t");
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
            tree = loadData;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            redrawCut(tree.sheet, offset);
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
        switch (modeState) {
            case Mode.atomMode:
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
    switch (modeState) {
        case Mode.cutMode:
            cutMouseDown(event);
            break;
        case Mode.atomMode:
            atomMouseDown(event);
            break;
        case Mode.dragMode:
            dragMouseDown(event);
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
        switch (modeState) {
            case Mode.cutMode:
                cutMouseMove(event);
                break;
            case Mode.atomMode:
                atomMouseMove(event);
                break;
            case Mode.dragMode:
                dragMouseMove(event);
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
    switch (modeState) {
        case Mode.cutMode:
            cutMouseUp(event);
            break;
        case Mode.atomMode:
            atomMouseUp(event);
            break;
    }
    hasMouseDown = false;
}

/**
 * If mouse down has been used calls the respective mouse out function based on mode.
 * Resets mouse down after use.
 */
function mouseOutHandler() {
    switch (modeState) {
        case Mode.cutMode:
            cutMouseOut();
            break;
        case Mode.atomMode:
            atomMouseOut();
            break;
        case Mode.dragMode:
            dragMosueOut();
            break;
    }
    hasMouseIn = false;
}

function mouseEnterHandler() {
    hasMouseIn = true;
}

/**
 * Iterates through the entire tree, if there are no children the for loop will not begin.
 * Sends any Atom children to redrawAtom.
 * @param incomingNode The CutNode to be iterated through
 * @param offset The difference between the actual graph and the current canvas
 */
export function redrawCut(incomingNode: CutNode, offset: Point) {
    cutDisplay.innerHTML = tree.toString();
    for (let i = 0; incomingNode.children.length > i; i++) {
        if (incomingNode.children[i] instanceof AtomNode) {
            redrawAtom(<AtomNode>incomingNode.children[i]);
        } else {
            redrawCut(<CutNode>incomingNode.children[i], offset);
        }
    }
    if (incomingNode.ellipse instanceof Ellipse) {
        ctx.strokeStyle = "#000000";
        ctx.beginPath();
        ctx.ellipse(
            incomingNode.ellipse.center.x + offset.x,
            incomingNode.ellipse.center.y + offset.y,
            incomingNode.ellipse.radiusX,
            incomingNode.ellipse.radiusY,
            0,
            0,
            2 * Math.PI
        );
        ctx.stroke();
    }
}

/**
 * Redraws the given atom. Also redraws the the bounding box.
 * @param incomingNode The Atom Node to be redrawn
 * @param offset The difference between the actual graph and the current canvas
 */
function redrawAtom(incomingNode: AtomNode) {
    drawAtom(incomingNode, "#000000", false);
}

/**
 * Resizes the canvas to the current width and height of the window
 */
function resizeHandler() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.onresize = resizeHandler;
