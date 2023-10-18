import {describe, test, expect} from "vitest";

import {AtomNode} from "../src/AEG/AtomNode";
import {CutNode} from "../src/AEG/CutNode";
import {Point} from "../src/AEG/Point";
import {Ellipse} from "../src/AEG/Ellipse";
import {Rectangle} from "../src/AEG/Rectangle";
import {AEGTree} from "../src/AEG/AEGTree";
import {shapesOverlap, shapesIntersect} from "../src/AEG/AEGUtils";

const origin = new Point(0, 0);
const testCenter = new Point(5, 5);
const testEllipse = new Ellipse(testCenter, 5, 5);

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

describe.skip("AEGTree verify soliloquy:", () => {
    const tree: AEGTree = new AEGTree();
});

describe.skip("AEGTree canInsert soliloquy:", () => {
    const tree: AEGTree = new AEGTree();
});

describe.skip("AEGTree insert soliloquy:", () => {
    const tree: AEGTree = new AEGTree();
});

describe("AEGTree remove soliloquy:", () => {
    const tree: AEGTree = new AEGTree();

    test("Removing the Sheet of Assertion should return false.", () => {
        expect(tree.remove(new Point(0, 0))).toBeFalsy();
    });

    test("Removing a child of the tree should be successful.", () => {
        tree.insert(new AtomNode("A", new Point(0, 4), 3, 3));
        expect(tree.remove(new Point(2, 2))).toBeTruthy();
    });
});

describe.skip("AEGTree intersects soliloquy:", () => {
    const tree: AEGTree = new AEGTree();
});

describe.skip("AEGTree overlaps soliloquy:", () => {
    const tree: AEGTree = new AEGTree();
});

describe("AEGTree toString soliloquy:", () => {
    const tree: AEGTree = new AEGTree();

    test("An empty tree should produce a formula string with only square brackets.", () => {
        expect(tree.toString()).toStrictEqual("[]");
    });

    test("Tree should produce an appropriate formula string with children one level deep.", () => {
        tree.insert(new CutNode(testEllipse));
        tree.insert(new AtomNode("B", origin, 1, 1));
        expect(tree.toString()).toStrictEqual("[() B]");
    });

    test("Tree should produce an appropriate formula string with children one+ levels deep.", () => {
        const treeThree = new AEGTree(); //treeTwo didn't make the cut...
        const parentCutNode: CutNode = new CutNode(testEllipse);
        parentCutNode.child = new AtomNode("X", new Point(5, 5), 0.1, 0.1);
        parentCutNode.child = new CutNode(new Ellipse(testCenter, 4, 4));
        const emptyCutNode: CutNode = new CutNode(new Ellipse(testCenter, 3, 3));
        const childAtomNode: AtomNode = new AtomNode("Y", new Point(3, 3), 0.1, 0.1);

        const children: (CutNode | AtomNode)[] = [];

        children.push(parentCutNode);
        children.push(emptyCutNode);
        children.push(childAtomNode);

        const cNode: CutNode = new CutNode(new Ellipse(testCenter, 10, 10), children);
        treeThree.insert(cNode);
        expect(treeThree.toString()).toStrictEqual("[((X ()) () Y)]");
    });
});
