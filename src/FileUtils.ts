import {AEGTree} from "./AEG/AEGTree";
import {AtomNode} from "./AEG/AtomNode";
import {CutNode} from "./AEG/CutNode";
import {Ellipse} from "./AEG/Ellipse";
import {Point} from "./AEG/Point";
import {Rectangle} from "./AEG/Rectangle";

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
    internalRectangle: {
        startVertex: {x: number; y: number};
        width: number;
        height: number;
    };
    internalIdentifier: string;
    internalOrigin: {x: number; y: number};
}

/**
 * Function that serializes the given AEG into a formatted JSON object
 * @param tree The given AEG
 * @returns A formatted JSON string representing the AEG
 */
export function saveFile(tree: AEGTree): string {
    const aegData = JSON.stringify(tree, null, "\t");
    return aegData;
}

/**
 * Function that takes in data read from a file and converts it into a valid AEG representation.
 * @param fileData The data read from a file.
 * @returns An AEG representation of the data.
 * Returns null if an error occurred
 */
export function loadFile(fileData: string | ArrayBuffer | null): AEGTree | null {
    if (typeof fileData === "string") {
        const data: sheetObj = JSON.parse(fileData);
        const childData: (atomObj | cutObj)[] = data.internalSheet.internalChildren;

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

    return null;
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
    const rect: Rectangle = new Rectangle(
        new Point(data.internalRectangle.startVertex.x, data.internalRectangle.startVertex.y),
        data.internalRectangle.width,
        data.internalRectangle.height
    );

    const identifier: string = data.internalIdentifier;

    const origin: Point = new Point(data.internalOrigin.x, data.internalOrigin.y);

    return new AtomNode(identifier, origin, rect);
}
