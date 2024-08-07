/**
 * @file Collection of methods used for drawing on the HTML canvas.
 *
 * @author Dawn Moore
 * @author Anusha Tiwari
 */

import {aegJsonString} from "../AEG-IO";
import {AEGTree} from "../AEG/AEGTree";
import {AtomNode} from "../AEG/AtomNode";
import {CutNode} from "../AEG/CutNode";
import {Ellipse} from "../AEG/Ellipse";
import {offset} from "./DragTool";
import {cssVar, isColorblindTheme, isDarkTheme, legalColor, placedColor} from "../Themes";
import {Point} from "../AEG/Point";
import {TreeContext} from "../TreeContext";

//Constants related to handling identifier images.
const numberOfLegalIdentifiers = 52;
const numberOfUppercaseLegalIdentifiers = 26;
const imageDownsizeScalar = 0.5;

//Maps related to handling identifier images.
const letterMap: string[] = [];
const placementTypeToFileExtensionMap: string[] = [];

const lightIdentifierImagesMap: {[id: string]: HTMLImageElement} = {};
const darkIdentifierImagesMap: {[id: string]: HTMLImageElement} = {};
const nonColorblindGoodPlacementImagesMap: {[id: string]: HTMLImageElement} = {};
const nonColorblindBadPlacementImagesMap: {[id: string]: HTMLImageElement} = {};
const colorblindGoodPlacementImagesMap: {[id: string]: HTMLImageElement} = {};
const colorblindBadPlacementImagesMap: {[id: string]: HTMLImageElement} = {};

const mapOfImageMaps: {[id: string]: HTMLImageElement}[] = [];

//Setting up Canvas...
const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("canvas");
const res: CanvasRenderingContext2D | null = canvas.getContext("2d");

if (res === null) {
    throw Error("2d rendering context not supported.");
}
const ctx: CanvasRenderingContext2D = res;
ctx.font = "35pt arial";

//Tree strings displayed on webpage depending on whether the user is in draw/proof mode.
const cutDisplay = <HTMLParagraphElement>document.getElementById("graphString");
const proofString = <HTMLParagraphElement>document.getElementById("proofString");

//Current bounding box checkbox and all bounding box checkbox for Atoms, respectively.
const atomCheckBox = <HTMLInputElement>document.getElementById("atomBox");
const atomCheckBoxes = <HTMLInputElement>document.getElementById("atomBoxes");
atomCheckBoxes.addEventListener("input", checkBoxRedraw);

const pathToAtomImagesFolder = "./atoms/";

/**
 * Loads each uppercase and lowercase letter of the English alphabet into an array.
 */
async function loadLetterMap(): Promise<void> {
    for (let i = 0; i < numberOfLegalIdentifiers; i++) {
        if (i < numberOfUppercaseLegalIdentifiers) {
            letterMap.push(String.fromCharCode(65 + i));
        } else {
            letterMap.push(String.fromCharCode(97 + (numberOfLegalIdentifiers - i - 1)));
        }
    }
}

/**
 * Loads each image map into an array.
 */
async function loadMapOfImageMaps(): Promise<void> {
    mapOfImageMaps[0] = lightIdentifierImagesMap;
    mapOfImageMaps[1] = darkIdentifierImagesMap;
    mapOfImageMaps[2] = nonColorblindBadPlacementImagesMap;
    mapOfImageMaps[3] = nonColorblindGoodPlacementImagesMap;
    mapOfImageMaps[4] = colorblindBadPlacementImagesMap;
    mapOfImageMaps[5] = colorblindGoodPlacementImagesMap;
}

/**
 * Loads each file extension into an array, whose indices correspond with mapOfImageMaps'.
 */
async function loadPlacementTypeMap(): Promise<void> {
    placementTypeToFileExtensionMap[0] = ".png";
    placementTypeToFileExtensionMap[1] = "d.png";
    placementTypeToFileExtensionMap[2] = "nb.png";
    placementTypeToFileExtensionMap[3] = "ng.png";
    placementTypeToFileExtensionMap[4] = "cb.png";
    placementTypeToFileExtensionMap[5] = "cg.png";
}

/**
 * Loads each uppercase and lowercase identifier image into an array.
 */
export async function loadIdentifierImagesMap(): Promise<void> {
    await loadLetterMap();
    await loadMapOfImageMaps();
    await loadPlacementTypeMap();

    let currentLetter: string;
    let currentPath: string;

    for (let i = 0; i < numberOfLegalIdentifiers; i++) {
        currentLetter = letterMap[i];
        currentPath = pathToAtomImagesFolder + currentLetter;
        if (i >= numberOfUppercaseLegalIdentifiers) {
            currentPath += "_";
        }

        for (let j = 0; j < mapOfImageMaps.length; j++) {
            mapOfImageMaps[j][currentLetter] = new Image();
            mapOfImageMaps[j][currentLetter].src = (
                await fetch(currentPath + placementTypeToFileExtensionMap[j])
            ).url;
        }
    }
}

/**
 * Determines the actual width and height of the image corresponding to the incoming char string.
 * Since different identifier image types differ only in color content,
 * we can use lightIdentifierImagesMap to measure them all equally.
 *
 * @param incomingChar Incoming char string.
 * @returns Actual width and height of the image corresponding to incomingChar.
 */
export function getImageWidthAndHeightFromChar(incomingChar: string): Point {
    return new Point(
        lightIdentifierImagesMap[incomingChar].width * imageDownsizeScalar,
        lightIdentifierImagesMap[incomingChar].height * imageDownsizeScalar
    );
}

/**
 * Draws the incoming CutNode on canvas as the incoming color string.
 *
 * @param thisCut Incoming CutNode.
 * @param color Incoming color string.
 */
export function drawCut(thisCut: CutNode, color: string): void {
    const ellipse: Ellipse = <Ellipse>thisCut.ellipse;
    if (ellipse !== null) {
        ctx.strokeStyle = color;
        const center: Point = ellipse.center;
        ctx.beginPath();
        ctx.ellipse(
            center.x + offset.x,
            center.y + offset.y,
            ellipse.radiusX,
            ellipse.radiusY,
            0,
            0,
            2 * Math.PI
        );
        ctx.stroke();
    }
}

/**
 * Draws the incoming AtomNode as the incoming color string.
 * If the incoming boolean is true, which happens when the checkbox for drawing AtomNodes' bounding boxes is checked,
 * Then the incoming AtomNode's bounding box is drawn as well.
 *
 * @param incomingAtom Incoming AtomNode.
 * @param color Incoming color string.
 * @param currentAtom Incoming boolean.
 */
export function drawAtom(incomingAtom: AtomNode, color: string, currentAtom: boolean): void {
    let currentElement: HTMLImageElement;
    const currentIdentifier = incomingAtom.identifier;

    if (color === placedColor()) {
        if (isDarkTheme()) {
            currentElement = darkIdentifierImagesMap[currentIdentifier];
        } else {
            currentElement = lightIdentifierImagesMap[currentIdentifier];
        }
    } else if (color === legalColor()) {
        if (isColorblindTheme()) {
            currentElement = colorblindGoodPlacementImagesMap[currentIdentifier];
        } else {
            currentElement = nonColorblindGoodPlacementImagesMap[currentIdentifier];
        }
    } else {
        if (isColorblindTheme()) {
            currentElement = colorblindBadPlacementImagesMap[currentIdentifier];
        } else {
            currentElement = nonColorblindBadPlacementImagesMap[currentIdentifier];
        }
    }

    const desiredWidth: number = currentElement.width * imageDownsizeScalar;
    const desiredHeight: number = currentElement.height * imageDownsizeScalar;

    ctx.drawImage(
        currentElement,
        incomingAtom.origin.x + offset.x,
        incomingAtom.origin.y + offset.y,
        desiredWidth,
        desiredHeight
    );

    if (atomCheckBoxes.checked || (atomCheckBox.checked && currentAtom)) {
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.rect(
            incomingAtom.origin.x + offset.x,
            incomingAtom.origin.y + offset.y,
            desiredWidth,
            desiredHeight
        );
        ctx.stroke();
    }
}

/**
 * Draws the guidelines for some node's bounding box.
 * This bounding box is a Rectangle created from one incoming original Point to another current Point.
 * This Rectangle is drawn in the color of the incoming color string.
 *
 * @param original Incoming original Point.
 * @param current Incoming current Point.
 * @param color Incoming color string.
 */
export function drawGuidelines(original: Point, current: Point, color: string): void {
    ctx.beginPath();
    ctx.strokeStyle = color;
    const dx: number = original.x - current.x;
    const dy: number = original.y - current.y;
    ctx.rect(original.x + offset.x, original.y + offset.y, -dx, -dy);
    ctx.stroke();
}

/**
 * Sets canvas' HTML style tag to the incoming string.
 *
 * @param newMouseStyle Incoming string.
 */
export function changeCursorStyle(newMouseStyle: string): void {
    canvas.style.cssText = newMouseStyle;
}

/**
 * Determines and returns the appropriate cursor style from two incoming cursor style strings based on the incoming color string.
 * The first incoming cursor style string is the legal cursor string.
 * The second incoming cursor style string is the illegal cursor string.
 *
 * @param color Incoming color string.
 * @param legalCursorStyle First incoming cursor style string.
 * @param illegalCursorStyle Second incoming cursor style string.
 * @returns Appropriate cursor style string from legalCursorStyle and illegalCursorStyle determined from color.
 */
function determineCursorStyle(
    color: string,
    legalCursorStyle: string,
    illegalCursorStyle: string
): string {
    return color === legalColor() ? legalCursorStyle : illegalCursorStyle;
}

/**
 * Determines and returns the appropriate cursor style from two incoming cursor style strings based on the incoming color string.
 * The first incoming cursor style string is the legal cursor string.
 * The second incoming cursor style string is the illegal cursor string.
 * Then sets canvas' HTML style tag to the incoming string.
 *
 * @param color Incoming color string.
 * @param legalCursorStyle First incoming cursor style string.
 * @param illegalCursorStyle Second incoming cursor style string.
 */
export function determineAndChangeCursorStyle(
    color: string,
    legalCursorStyle: string,
    illegalCursorStyle: string
): void {
    changeCursorStyle(determineCursorStyle(color, legalCursorStyle, illegalCursorStyle));
}

/**
 * Redraws the draw mode AEGTree after a bounding box checkbox is activated.
 */
function checkBoxRedraw(): void {
    redrawTree(TreeContext.tree);
}

/**
 * Completely clears canvas of all drawings.
 */
export function cleanCanvas(): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Clears canvas and redraws the incoming AEGTree as the incoming color string.
 * Also, updates cutDisplay and the window's string forms of the incoming AEGTree.
 *
 * @param tree Incoming AEGTree.
 * @param color Incoming color string.
 */
export function redrawTree(tree: AEGTree, color?: string): void {
    cutDisplay.innerHTML = tree.toString();
    cleanCanvas();
    redrawCut(tree.sheet, color);
    window.treeString = aegJsonString(tree);
}

/**
 * Redraws the incoming CutNode and all its children as the incoming color string.
 *
 * @param incomingNode Incoming CutNode.
 * @param color Incoming color string. Defaults to the color of a valid placement if not passed in.
 */
function redrawCut(incomingNode: CutNode, color?: string): void {
    for (let i = 0; i < incomingNode.children.length; i++) {
        if (incomingNode.children[i] instanceof AtomNode) {
            redrawAtom(<AtomNode>incomingNode.children[i]);
        } else {
            redrawCut(<CutNode>incomingNode.children[i]);
        }
    }
    if (incomingNode.ellipse instanceof Ellipse) {
        ctx.strokeStyle = color ? color : placedColor();
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
        ctx.globalCompositeOperation = "destination-over";

        ctx.fillStyle =
            (TreeContext.modeState === "Draw" &&
                TreeContext.tree.getLevel(incomingNode) % 2 === 0) ||
            (TreeContext.modeState === "Proof" &&
                TreeContext.currentProofStep!.tree.getLevel(incomingNode) % 2 === 0)
                ? cssVar("--canvas-odd-bg")
                : cssVar("--canvas-bg");
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
        ctx.stroke();
    }
}

/**
 * Redraws the incoming AtomNode. Also redraws the incoming AtomNode's bounding box.
 *
 * @param incomingNode Incoming AtomNode.
 */
export function redrawAtom(incomingNode: AtomNode): void {
    drawAtom(incomingNode, placedColor(), false);
}

/**
 * Redraws the current proof AEGTree after clearing the canvas.
 * Also updates the proof's tree string.
 */
export function redrawProof(): void {
    //If this is the first step taken in the proof,
    //Set the current AEGTree as the head of the proof history.
    let tree: AEGTree;
    if (TreeContext.proof.length === 0 || TreeContext.currentProofStep === undefined) {
        tree = new AEGTree();
    } else {
        tree = TreeContext.currentProofStep.tree;
    }

    cleanCanvas();
    proofString.innerHTML = tree.toString();
    redrawCut(tree.sheet);
}

/**
 * Highlights all the children of the incoming child node as the incoming color string.
 *
 * @param child Incoming child node.
 * @param color Incoming color string.
 */
export function highlightNode(child: AtomNode | CutNode, color: string): void {
    if (child instanceof AtomNode) {
        drawAtom(child, color, false);
    } else if (child instanceof CutNode) {
        drawCut(child, color);
        for (let i = 0; i < child.children.length; i++) {
            highlightNode(child.children[i], color);
        }
    }
}

/**
 * Calculates and returns a Point which represents the direction for the incoming CutNode to move towards, based off the incoming Point.
 *
 * @param currentNode Incoming CutNode.
 * @param startingPoint Incoming Point.
 * @returns Direction for currentNode to move towards.
 */
export function determineDirection(currentNode: CutNode, startingPoint: Point): Point {
    const newDirection = new Point(1, 1);
    if (currentNode instanceof CutNode && (currentNode as CutNode).ellipse !== null) {
        const currentEllipse: Ellipse = currentNode.ellipse as Ellipse;

        //widestPoints[0] = Leftmost widest Point of the currentEllipse.
        //widestPoints[1] = Topmost widest Point of currentEllipse.
        //widestPoints[2] = Rightmost widest Point of currentEllipse.
        //widestPoints[3] = Bottommost widest Point of currentEllipse.
        const widestPoints: Point[] = [
            new Point(currentEllipse.center.x - currentEllipse.radiusX, currentEllipse.center.y),
            new Point(currentEllipse.center.x, currentEllipse.center.y - currentEllipse.radiusY),
            new Point(currentEllipse.center.x + currentEllipse.radiusX, currentEllipse.center.y),
            new Point(currentEllipse.center.x, currentEllipse.center.y + currentEllipse.radiusY),
        ];

        //If the current Point is closer to the top or equal, the direction is positive and going down.
        if (widestPoints[0].distance(startingPoint) >= widestPoints[2].distance(startingPoint)) {
            newDirection.x = 1;
        } else {
            newDirection.x = -1;
        }

        //If the current Point is closer to the left or equal, the direction is positive and going right.
        if (widestPoints[1].distance(startingPoint) >= widestPoints[3].distance(startingPoint)) {
            newDirection.y = 1;
        } else {
            newDirection.y = -1;
        }
    }
    return newDirection;
}
