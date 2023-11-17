import {describe, test, expect} from "vitest";

import {AtomNode} from "../src/AEG/AtomNode";
import {CutNode} from "../src/AEG/CutNode";
import {Point} from "../src/AEG/Point";
import {Ellipse} from "../src/AEG/Ellipse";
import {AEGTree} from "../src/AEG/AEGTree";

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

describe("AEGTree verify soliloquy:", () => {
    const tree: AEGTree = new AEGTree();

    test("Verification with empty Sheet of Assertion should be successful.", () => {
        expect(tree.verify()).toBeTruthy();
    });

    test("Verification with CutNode with valid children should be successful.", () => {
        tree.insert(new CutNode(new Ellipse(testCenter, 50, 50)));
        tree.insert(new CutNode(testEllipse));
        tree.insert(new AtomNode("A", origin, 1, 1));
        expect(tree.verify()).toBeTruthy();
    });

    test("Verification with CutNode with invalid children should be unsuccessful.", () => {
        const cocoNode: CutNode = new CutNode(new Ellipse(testCenter, 20, 20)); //hi Coco
        cocoNode.child = new AtomNode("F", new Point(1000, 1000), 50, 50);
        cocoNode.child = new CutNode(new Ellipse(new Point(-5000, -5000), 2, 2));
        tree.insert(cocoNode);
        expect(tree.verify()).toBeFalsy();
    });

    test("Verification after inserting a CutNode around existing nodes should be successful.", () => {
        const treeThree: AEGTree = new AEGTree();

        treeThree.insert(new CutNode(new Ellipse(testCenter, 10, 10)));
        treeThree.insert(new AtomNode("K", origin, 1, 1));
        treeThree.insert(new CutNode(new Ellipse(testCenter, 100, 100)));
        expect(treeThree.verify()).toBeTruthy();
    });
});

describe("AEGTree canInsert soliloquy:", () => {
    const tree: AEGTree = new AEGTree();

    test("Empty tree should be able to insert all types of node.", () => {
        expect(tree.canInsert(new AtomNode("G", origin, 5, 5))).toBeTruthy();
        expect(tree.canInsert(new CutNode(testEllipse))).toBeTruthy();
    });

    test("Intersecting CutNodes should not be able to be inserted.", () => {
        tree.insert(new CutNode(testEllipse));
        expect(tree.canInsert(new CutNode(new Ellipse(testCenter, 5, 6)))).toBeFalsy();
    });

    test("AtomNode intersecting a CutNode should not be able to be inserted.", () => {
        expect(tree.canInsert(new AtomNode("A", new Point(8, 5), 5, 5))).toBeFalsy();
    });

    test("AtomNode intersecting an AtomNode should not be able to be inserted.", () => {
        tree.insert(new AtomNode("Y", testCenter, 3, 3));
        expect(tree.canInsert(new AtomNode("N", testCenter, 4, 4))).toBeFalsy();
    });

    //Should be impossible, just wanted a case written to express the thought. Currently throws an error if not skipped
    test.fails("Tree should not be able to insert another Sheet of Assertion.", () => {
        expect(tree.canInsert(new CutNode(null))).toBeFalsy();
    });
});

describe("AEGTree insert soliloquy:", () => {
    const tree: AEGTree = new AEGTree();

    test("Insertions on an empty sheet should be successful.", () => {
        expect(tree.insert(new CutNode(testEllipse))).toBeTruthy();
        expect(tree.insert(new AtomNode("Y", testCenter, 3, 3))).toBeTruthy();
    });

    test.fails("Attempting to insert an intersecting CutNode should throw an error.", () => {
        tree.insert(new CutNode(new Ellipse(testCenter, 5, 6)));
    });

    test.fails("Attempting to insert an intersecting AtomNode should throw an error.", () => {
        tree.insert(new AtomNode("N", testCenter, 4, 4));
    });

    test("Insertion inside an existing CutNode should be successful.", () => {
        tree.remove(testCenter);
        expect(tree.insert(new CutNode(new Ellipse(testCenter, 4, 4)))).toBeTruthy();
        expect(tree.insert(new AtomNode("Z", testCenter, 0.01, 0.01))).toBeTruthy();
    });

    test("Insertion around existing nodes should be successful.", () => {
        expect(tree.insert(new CutNode(new Ellipse(testCenter, 50, 50)))).toBeTruthy();
    });
});

describe("AEGTree remove soliloquy:", () => {
    const tree: AEGTree = new AEGTree();

    test("Removing the Sheet of Assertion should return false.", () => {
        expect(tree.remove(new Point(0, 0))).toBeFalsy();
    });

    test("Removing a child of the tree one level deep should be successful.", () => {
        tree.insert(new AtomNode("A", new Point(0, 4), 3, 3));
        expect(tree.remove(new Point(2, 2))).toBeTruthy();
    });

    test("Removing a child of the tree one+ levels deep should be successful.", () => {
        const coco: CutNode = new CutNode(new Ellipse(origin, 10, 10)); //my friend's cat is named Coco
        coco.child = new AtomNode("P", new Point(7, 7), 2, 2);
        tree.insert(coco);
        expect(tree.remove(new Point(6, 6))).toBeTruthy();
    });
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
