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
import {saveFile, loadFile} from "./FileUtils";
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
window.addEventListener("keypress", keyPressHandler);
canvas.addEventListener("mousedown", mouseDownHandler);
canvas.addEventListener("mousemove", mouseMoveHandler);
canvas.addEventListener("mouseup", mouseUpHandler);
canvas.addEventListener("mouseout", mouseOutHandler);
canvas.addEventListener("mouseenter", mouseEnterHandler);
let modeState = "";
let hasMouseDown = false;
let hasMouseIn = true;
export let tree: AEGTree = new AEGTree();

//Window Exports
window.atomMode = atomMode;
window.cutMode = cutMode;
window.dragMode = dragMode;
window.saveMode = saveMode;
window.loadMode = loadMode;
declare global {
    interface Window {
        cutMode: () => void;
        atomMode: () => void;
        dragMode: () => void;
        saveMode: () => void;
        loadMode: () => void;
    }
}

/**
 * If there is no current mode creates the listeners. Hides non cutTools.
 * Sets the current mode to cut mode.
 */
function cutMode() {
    modeState = "cutMode";
    cutTools.style.display = "block";
    //Block all other mode tools
    atomTools.style.display = "none";
}

/**
 * Sets the current mode to atom mode. Hides non atomTools.
 */
function atomMode() {
    modeState = "atomMode";
    atomTools.style.display = "block";
    //Block all other mode tools
    cutTools.style.display = "none";
}

/**
 * Sets the current mode to move mode. Hides non moveTools.
 */
function dragMode() {
    modeState = "dragMode";
    cutTools.style.display = "none";
    atomTools.style.display = "none";
}

/**
 * Calls the function to save the file.
 */
async function saveMode() {
    //TODO: CTRL+S Hotkey
    const file = saveFile(tree);

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

        const writable = await saveHandle.createWritable();
        await writable.write(file);
        await writable.close();
    } else {
        //Quick Download
        const f = document.createElement("a");
        f.href = file;
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
            redrawCut(tree.sheet, offset);
        }
        //TODO: else popup error
    });

    reader.readAsText(file);
}
/**
 * Calls the respective keypress function depending on current mode.
 * @param event The event of a keypress
 */
function keyPressHandler(event: KeyboardEvent) {
    switch (modeState) {
        case "atomMode":
            atomKeyPress(event);
            break;
    }
}

/**
 * Calls the respective mouse down function depending on current mode.
 * @param event The mouse down event
 */
function mouseDownHandler(event: MouseEvent) {
    switch (modeState) {
        case "cutMode":
            cutMouseDown(event);
            break;
        case "atomMode":
            atomMouseDown(event);
            break;
        case "dragMode":
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
            case "cutMode":
                cutMouseMove(event);
                break;
            case "atomMode":
                atomMouseMove(event);
                break;
            case "dragMode":
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
        case "cutMode":
            cutMouseUp(event);
            break;
        case "atomMode":
            atomMouseUp();
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
        case "cutMode":
            cutMouseOut();
            break;
        case "atomMode":
            atomMouseOut();
            break;
        case "dragMode":
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
            redrawAtom(<AtomNode>incomingNode.children[i], offset);
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
function redrawAtom(incomingNode: AtomNode, offset: Point) {
    const displayBox = incomingNode.rectangle;
    ctx.strokeStyle = "#000000";
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.rect(
        displayBox.startVertex.x + offset.x,
        displayBox.startVertex.y + offset.y,
        displayBox.width,
        displayBox.height
    );
    ctx.fillText(
        incomingNode.identifier,
        incomingNode.origin.x + offset.x,
        incomingNode.origin.y + offset.y
    );
    ctx.stroke();
}

/**
 * Resizes the canvas to the current width and height of the window
 */
function resizeHandler() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.onresize = resizeHandler;