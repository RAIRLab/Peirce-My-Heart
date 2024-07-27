/**
 * @file Contains methods for loading and saving AEGs from JSON files.
 *
 * @author Anusha Tiwari
 */

import {registerSchema, validate} from "@hyperjump/json-schema";

import {AEGTree} from "./AEG/AEGTree";
import {AtomNode} from "./AEG/AtomNode";
import {CutNode} from "./AEG/CutNode";
import {Ellipse} from "./AEG/Ellipse";
import {Point} from "./AEG/Point";
import {ProofModeMove, ProofModeNode} from "./ProofHistory/ProofModeNode";

/**
 * Describes The Sheet of Assertion in JSON files.
 */
interface sheetObj {
    internalSheet: cutObj;
}

/**
 * Describes a CutNode in JSON files.
 */
interface cutObj {
    internalEllipse: {
        center: {x: number; y: number};
        radiusX: number;
        radiusY: number;
    };
    internalChildren: (atomObj | cutObj)[];
}

/**
 * Describes an AtomNode in JSON files.
 */
interface atomObj {
    internalWidth: number;
    internalHeight: number;
    internalIdentifier: string;
    internalOrigin: {x: number; y: number};
}

/**
 * Describes a ProofNode in JSON files.
 */
interface proofNodeObj {
    tree: sheetObj;
    appliedRule: ProofModeMove;
}

/**
 * Creates and saves a file to the incoming FileSystemFileHandle
 * and containing the incoming save data.
 *
 * The save data will either be an AEGTree from Draw Mode or a series of ProofModeNodes from Proof Mode.
 *
 * @param handle Incoming FileSystemFileHandle.
 * @param aegData Incoming save data.
 */
export async function saveFile(
    handle: FileSystemFileHandle,
    saveData: AEGTree | ProofModeNode[]
): Promise<void> {
    const data: string = JSON.stringify(saveData, null, "\t");

    const writable = await handle.createWritable();
    await writable.write(data);
    await writable.close();
}

/**
 * Returns incoming data read from a file as an equivalent AEG representation.
 * Output depends on the incoming mode string.
 *
 * @param mode Incoming mode string.
 * @param fileData Incoming data read from a file.
 * @returns AEGTree representation of fileData if in Draw Mode. Otherwise, a series of ProofModeNodes.
 */
export async function loadFile(
    mode: "Draw" | "Proof",
    fileData: string
): Promise<AEGTree | ProofModeNode[]> {
    const pmhSchema = "https://rairlab.github.io/Peirce-My-Heart/DrawSchema.json";

    registerSchema(
        {$schema: "https://json-schema.org/draft/2020-12/schema", type: "string"},
        pmhSchema
    );

    const data = JSON.parse(fileData);

    const isValid = await validate(pmhSchema, data);

    if (isValid.valid) {
        console.log("COMPLETELY VALID");
    } else {
        console.log("COMPLETELY INVALID");
    }

    if (mode === "Draw") {
        const childData: (atomObj | cutObj)[] = (data as sheetObj).internalSheet.internalChildren;
        return toTree(childData);
    } else {
        //Construct the tree at every step of the proof and store them in an array
        const arr: ProofModeNode[] = [];

        let node: proofNodeObj;
        for (node of data) {
            const childData: (atomObj | cutObj)[] = node.tree.internalSheet.internalChildren;
            arr.push(new ProofModeNode(toTree(childData), node.appliedRule));
        }

        return arr;
    }
}

/**
 * Constructs an AEGTree from the incoming array of JSON node objects.
 * JSON node objects will be either AtomObjects or CutObjects.
 *
 * @param childData Incoming array of JSON node objects.
 * @returns An equivalent AEGTree representation of childData.
 */
function toTree(childData: (atomObj | cutObj)[]): AEGTree {
    const tree: AEGTree = new AEGTree();
    const children: (AtomNode | CutNode)[] = [];

    for (const child of childData) {
        if (Object.prototype.hasOwnProperty.call(child, "internalEllipse")) {
            children.push(toCut(child as cutObj));
        } else {
            children.push(toAtom(child as atomObj));
        }
    }

    tree.sheet.children = children;
    return tree;
}

/**
 * Parses the incoming CutObject and returns an equivalent CutNode.
 *
 * @param cutData Incoming CutObject.
 * @returns CutNode equivalent of cutData.
 */
function toCut(cutData: cutObj): CutNode {
    const ellipse: Ellipse = new Ellipse(
        new Point(cutData.internalEllipse.center.x, cutData.internalEllipse.center.y),
        cutData.internalEllipse.radiusX,
        cutData.internalEllipse.radiusY
    );

    const children: (AtomNode | CutNode)[] = [];

    for (const child of cutData.internalChildren) {
        if ("internalEllipse" in child) {
            children.push(toCut(child));
        } else {
            children.push(toAtom(child));
        }
    }

    return new CutNode(ellipse, children);
}

/**
 * Parses the incoming AtomObject and returns and equivalent AtomNode.
 *
 * @param atomData Incoming AtomObject.
 * @returns AtomNode equivalent of atomData.
 */
function toAtom(atomData: atomObj): AtomNode {
    const identifier: string = atomData.internalIdentifier;

    const origin: Point = new Point(atomData.internalOrigin.x, atomData.internalOrigin.y);

    return new AtomNode(identifier, origin, atomData.internalWidth, atomData.internalHeight);
}
