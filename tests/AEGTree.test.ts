import {describe, test, expect} from "vitest";

import {AtomNode} from "../src/AEG/AtomNode";
import {CutNode} from "../src/AEG/CutNode";
import {Point} from "../src/AEG/Point";
import {Ellipse} from "../src/AEG/Ellipse";
import {Rectangle} from "../src/AEG/Rectangle";
import {AEGTree} from "../src/AEG/AEGTree";
import {shapesOverlap, shapesIntersect} from "../src/AEG/AEGUtils";

/**
 * Contains comprehensive tests on the AEGTree class.
 * @author Ryan Reilly
 */
describe("AEGTree constructor soliloquy:", () => {
    const tree: AEGTree = new AEGTree();

    test("AEGTree default constructor should set the root to a null CutNode.", () => {
        expect(tree.sheet).toStrictEqual(new CutNode(null));
    });
});

describe.skip("AEGTree canInsert soliloquy:", () => {
    const tree: AEGTree = new AEGTree();
});

describe.skip("AEGTree insert soliloquy:", () => {
    const tree: AEGTree = new AEGTree();
});

describe.skip("AEGTree remove soliloquy:", () => {
    const tree: AEGTree = new AEGTree();
});

describe.skip("AEGTree intersects soliloquy:", () => {
    const tree: AEGTree = new AEGTree();
});

describe.skip("AEGTree overlaps soliloquy:", () => {
    const tree: AEGTree = new AEGTree();
});

describe.skip("AEGTree toString soliloquy:", () => {
    const tree: AEGTree = new AEGTree();
});
