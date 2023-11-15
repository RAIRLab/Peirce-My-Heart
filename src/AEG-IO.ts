import {AEGTree} from "./AEG/AEGTree";
import {AtomNode} from "./AEG/AtomNode";
import {CutNode} from "./AEG/CutNode";
import {Ellipse} from "./AEG/Ellipse";
import {Point} from "./AEG/Point";
import {ProofNode} from "./AEG/ProofNode";

/**
 * Interface for an object describing Sheet of Assertion
 */
interface sheetObj {
    internalSheet: cutObj;
}

/**
 * Interface for an object describing a Cut Node
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
 * Interface for an object describing an Atom Node
 */
interface atomObj {
    internalWidth: number;
    internalHeight: number;
    internalIdentifier: string;
    internalOrigin: {x: number; y: number};
}

interface nodeObj {
    tree: sheetObj;
    appliedRule: string;
}

/**
 * Function that creates and saves a file containing the given AEG data
 * @param handle The handler for the save file picker
 * @param aegData Serialized JSON string containing the AEG data
 */
export async function saveFile(handle: FileSystemFileHandle, saveData: AEGTree | ProofNode[]) {
    const data = JSON.stringify(saveData, null, "\t");

    const writable = await handle.createWritable();
    await writable.write(data);
    await writable.close();
}

/**
 * Function that takes in data read from a file and converts it into a valid AEG representation.
 * @param mode The mode we are in (Draw mode or proof mode)
 * @param fileData The data read from a file.
 * @returns If in draw mode, returns an AEG representation of the data.
 * If in proof mode, constructs an array of AEGs read from the file.
 * This can be used to build the proof list
 * Returns null if an error occurred
 */
export function loadFile(
    mode: "Draw" | "Proof",
    fileData: string | ArrayBuffer | null
): AEGTree | ProofNode[] | null {
    if (typeof fileData === "string") {
        const data = JSON.parse(fileData);

        if (mode === "Draw") {
            const childData: (atomObj | cutObj)[] = (data as sheetObj).internalSheet
                .internalChildren;
            return toTree(childData);
        } else {
            //Construct the tree at every step of the proof and store them in an array
            const arr: ProofNode[] = [];
            data.forEach((node: nodeObj) => {
                const childData: (atomObj | cutObj)[] = node.tree.internalSheet.internalChildren;
                arr.push(new ProofNode(toTree(childData), node.appliedRule));
            });

            return arr;
        }
    }

    return null;
}

/**
 * Constructs an AEG from the array of JSON objects parsed from our file data.
 * @param childData The array of objects which should be filled in as children of the tree.
 * @returns An AEG Tree representation of our data.
 */
function toTree(childData: (atomObj | cutObj)[]): AEGTree {
    const tree: AEGTree = new AEGTree();
    const children: (AtomNode | CutNode)[] = [];

    childData.forEach(child => {
        if (Object.prototype.hasOwnProperty.call(child, "internalEllipse")) {
            //make cut
            children.push(toCut(child as cutObj));
        } else {
            //Make atom
            children.push(toAtom(child as atomObj));
        }
    });

    tree.sheet.children = children;
    return tree;
}

/**
 * Function that parses a Cut Object into a valid CutNode
 * @param data The Cut Object to be parsed
 * @returns A CutNode
 */
function toCut(data: cutObj): CutNode {
    const ellipse: Ellipse = new Ellipse(
        new Point(data.internalEllipse.center.x, data.internalEllipse.center.y),
        data.internalEllipse.radiusX,
        data.internalEllipse.radiusY
    );

    const children: (AtomNode | CutNode)[] = [];

    data.internalChildren.forEach(child => {
        if ("internalEllipse" in child) {
            children.push(toCut(child));
        } else {
            children.push(toAtom(child));
        }
    });

    return new CutNode(ellipse, children);
}

/**
 * Function that parses an Atom Object into a valid AtomNode
 * @param data The object to be parsed
 * @returns An AtomNode
 */
function toAtom(data: atomObj): AtomNode {
    const identifier: string = data.internalIdentifier;

    const origin: Point = new Point(data.internalOrigin.x, data.internalOrigin.y);

    return new AtomNode(identifier, origin, data.internalWidth, data.internalHeight);
}
