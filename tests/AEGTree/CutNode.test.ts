/**
 * @file Contains comprehensive tests on the CutNode class.
 *
 * @author Ryan R
 */
import {describe, expect, test} from "vitest";

import {AtomNode} from "../../src/AEG/AtomNode";
import {CutNode} from "../../src/AEG/CutNode";
import {Ellipse} from "../../src/AEG/Ellipse";
import {Point} from "../../src/AEG/Point";

const origin = new Point(0, 0);
const testCenter = new Point(5, 5);
const testEllipse = new Ellipse(testCenter, 5, 5);

describe("CutNode constructor soliloquy:", () => {
    const cNode: CutNode = new CutNode(testEllipse);
    test("CutNode constructor with only one argument passed in should produce a child list of length 0.", () => {
        expect(cNode.children.length).toBe(0);
    });

    test("CutNode constructor should accept children of type CutNode and AtomNode.", () => {
        cNode.child = new AtomNode("A", new Point(5, 5), 3, 3);
        cNode.child = new CutNode(new Ellipse(new Point(2, 2), 1, 1));

        expect(cNode.children.length).toBe(2);
        expect(cNode.children[0]).toBeInstanceOf(AtomNode);
        expect(cNode.children[1]).toBeInstanceOf(CutNode);
    });

    test("CutNode constructor should accept and reproduce an existing child list.", () => {
        const cList: (CutNode | AtomNode)[] = [];

        const atomA: AtomNode = new AtomNode("A", new Point(6, 6), 2, 2);
        const atomB: AtomNode = new AtomNode("B", new Point(7, 7), 1, 1);
        const atomC: AtomNode = new AtomNode("C", new Point(8, 8), 0.5, 0.5);
        const cutA: CutNode = new CutNode(new Ellipse(new Point(2, 2), 0, 0));
        const cutB: CutNode = new CutNode(new Ellipse(new Point(3, 3), 2, 2));

        cList.push(atomA);
        cList.push(atomB);
        cList.push(atomC);
        cList.push(cutA);
        cList.push(cutB);

        const cNodeDos: CutNode = new CutNode(null, cList);

        expect(cNodeDos.children.length).toBe(5);

        expect(cNodeDos.children[0]).toStrictEqual(atomA);
        expect(cNodeDos.children[1]).toStrictEqual(atomB);
        expect(cNodeDos.children[2]).toStrictEqual(atomC);
        expect(cNodeDos.children[3]).toStrictEqual(cutA);
        expect(cNodeDos.children[4]).toStrictEqual(cutB);
    });

    test.fails.each([
        [-1, 1],
        [1, -1],
        [NaN, NaN],
        [Infinity, Infinity],
        [-Infinity, Infinity],
        [Infinity, -Infinity],
        [-Infinity, -Infinity],
    ])(
        "CutNode constructions with Ellipse with center (5, 5), radX = %f, radY = %f should throw errors.",
        (radX, radY) => {
            new CutNode(new Ellipse(testCenter, radX, radY));
        }
    );
});

describe("CutNode getCurrentCut soliloquy:", () => {
    const sheetNode: CutNode = new CutNode(null);
    const jay: AtomNode = new AtomNode("J", new Point(6, 6), 3, 3);

    test("getCurrentCut should return the CutNode it was called on if that CutNode has no children.", () => {
        expect(sheetNode.getCurrentCut(jay)).toStrictEqual(sheetNode);
    });

    test("getCurrentCut should return the CutNode it was called on if that CutNode only has children of type AtomNode.", () => {
        sheetNode.child = new AtomNode("X", testCenter, 1, 1);
        sheetNode.child = new AtomNode("Y", testCenter, 2, 2);
        sheetNode.child = new AtomNode("Z", testCenter, 3, 3);

        expect(sheetNode.getCurrentCut(jay)).toStrictEqual(sheetNode);
    });

    test("getCurrentCut should return the CutNode it was called on if a node of that type exists in its child list, but is not larger than the node sent as an argument.", () => {
        const sheetNodeChildCutSmaller: CutNode = new CutNode(new Ellipse(testCenter, 1, 1));
        sheetNode.child = sheetNodeChildCutSmaller;

        expect(sheetNode.getCurrentCut(jay)).toStrictEqual(sheetNode);
    });

    test("getCurrentCut should return a CutNode one level deep if a CutNode larger than the node sent as an argument exists in its child list.", () => {
        const sheetNodeChildCutLarger: CutNode = new CutNode(new Ellipse(testCenter, 10, 10));
        sheetNode.child = sheetNodeChildCutLarger;

        expect(sheetNode.getCurrentCut(jay)).toStrictEqual(sheetNodeChildCutLarger);
    });

    test("getCurrentCut should return the deepest CutNode that is still larger than the node sent as an argument.", () => {
        const smallestButStillBiggerChild: CutNode = new CutNode(new Ellipse(testCenter, 8, 8));
        const sheetNodeChildCutLarger: CutNode = sheetNode.children[4] as CutNode;
        sheetNodeChildCutLarger.child = new CutNode(new Ellipse(testCenter, 9, 9));
        (sheetNodeChildCutLarger.children[0] as CutNode).child = smallestButStillBiggerChild;

        expect(sheetNode.getCurrentCut(jay)).toStrictEqual(smallestButStillBiggerChild);
    });
});

describe("CutNode containsPoint soliloquy:", () => {
    const cNode: CutNode = new CutNode(testEllipse);
    test.each([
        [0, 0],
        [1000000, 1000000],
        [-100000, -10000.128971987],
    ])("Sheet of assertion should contain all points.", (x, y) => {
        expect(new CutNode(null).containsPoint(new Point(x, y))).toBeTruthy();
    });

    test.each([
        [5, 5], //Arbitrary points that should be contained within
        [3, 3],
        [7, 7],
    ])(
        "CutNode with Ellipse of center (5, 5) and {radX, radY} = 5 should contain (%i, %i)",
        (x, y) => {
            expect(cNode.containsPoint(new Point(x, y))).toBeTruthy();
        }
    );

    test.each([
        [0, 0], //We probably should not have our Ellipses be Rectangles. These would be the corners
        [0, 10],
        [10, 0],
        [10, 10],
        [10, 5], //Farthest reaches of this Ellipse
        [0, 5],
        [5, 0],
        [5, 10],
        [100, 100], //Arbitrary Points that shouldn't be within
        [200, 200],
    ])(
        "CutNode with Ellipse of center (5, 5), {radX, radY} = 5 should not contain Point (%f, %f).",
        (x, y) => {
            expect(cNode.containsPoint(new Point(x, y))).toBeFalsy();
        }
    );
});

describe("CutNode containsNode soliloquy:", () => {
    const cNode: CutNode = new CutNode(testEllipse);
    const sheetNode: CutNode = new CutNode(null);
    test.each([
        [sheetNode],
        [new CutNode(testEllipse)],
        [new CutNode(new Ellipse(new Point(100, 1098109238), 17824, 44.44444))],
        [new AtomNode("A", new Point(0, 0), 1, 1)],
        [new AtomNode("L", new Point(100000, -100091283), 3, 9999)],
    ])("Sheet of assertion should contain all nodes.", node => {
        expect(sheetNode.containsNode(node)).toBeTruthy();
    });

    test("CutNode of any measurement should not contain itself.", () => {
        expect(cNode.containsNode(cNode)).toBeFalsy();
    });

    test.each([
        [5, 0, 10, 10], //Begins at the CutNode's Ellipse's topmost point but top right corner is outside
        [5, 5, 10, 10], //Begins at the CutNode's Ellipse's center but bottom right corner is outside
        [0, 0, 5, 5], //Begins outside the CutNode's Ellipse but all other corners are contained within
        [0, 5, 5, 5],
    ])(
        "CutNode with Ellipse of center (5, 5) and {radX, radY} = 5 should not contain AtomNode with Rectangle of BL vertex (%f, %f) and w = %f, h = %f.",
        (x, y, w, h) => {
            expect(cNode.containsNode(new AtomNode("A", new Point(x, y), w, h))).toBeFalsy();
        }
    );

    test.each([
        [5, 5, 6, 6], //Begins at the same Point as the CutNode's Ellipse but is larger
        [15, 15, 5, 5], //Begins outside the CutNode's Ellipse and touches the CutNode's rightmost Point
        [5, 15, 5, 5], //Begins below the CutNode's Ellipse and touches the CutNode's bottommost Point
        [5, 5, 1, 10], //Begins at the same center but has one larger radius
        [5, 5, 10, 1],
        [2, 2, 3, 4], //Arbitrary CutNodes that should not be in here
        [8, 8, 8, 8],
        [2.3, -2, 5, 5],
    ])(
        "CutNode with Ellipse of center (5, 5) and {radX, radY} = 5 should not contain CutNode with Ellipse of center (%f, %f) and radX = %f, radY = %f.",
        (x, y, radX, radY) => {
            expect(
                cNode.containsNode(new CutNode(new Ellipse(new Point(x, y), radX, radY)))
            ).toBeFalsy();
        }
    );

    test.each([
        [5, 5, 2, 2], //Arbitrary AtomNodes that should be in here
        [5, 5, 3, 3],
        [3, 3, 0.5, 0.5],
        [8, 8, 0.5, 0.5],
    ])(
        "CutNode with Ellipse of center (5, 5) and {radX, radY} = 5 should contain AtomNode with Rectangle of BL vertex (%f, %f) and w = %f, h = %f.",
        (x, y, w, h) => {
            expect(cNode.containsNode(new AtomNode("A", new Point(x, y), w, h))).toBeTruthy();
        }
    );

    test.each([
        [5, 5, 1, 1], //Arbitrary CutNodes that should be in here
        [3, 3, 0.5, 0.5],
        [5, 5, 1, 3],
        [7, 7, 0.8, 0.8],
    ])(
        "CutNode with Ellipse of center (5, 5) and {radX, radY} = 5 should contain CutNode with Ellipse of center (%f, %f) and radX = %f, radY = %f.",
        (x, y, radX, radY) => {
            expect(
                cNode.containsNode(new CutNode(new Ellipse(new Point(x, y), radX, radY)))
            ).toBeTruthy();
        }
    );
});

describe("CutNode remove soliloquy:", () => {
    const cNode: CutNode = new CutNode(testEllipse);
    const sheetNode: CutNode = new CutNode(null);
    test("Removing the Sheet of Assertion should return false.", () => {
        expect(sheetNode.remove(new Point(5, 5))).toBeFalsy();
    });

    test("Removing a child of the Sheet of Assertion should be successful.", () => {
        sheetNode.child = new AtomNode("H", new Point(0, 0), 3, 3);
        expect(sheetNode.remove(new Point(2, 2))).toBeTruthy();
        expect(sheetNode.children.length).toBe(0);
    });

    test("Removing a Point not within the requested CutNode should return false.", () => {
        expect(cNode.remove(new Point(50, 50))).toBeFalsy();
    });

    test("Removing an AtomNode one level deep should be successful.", () => {
        cNode.child = new AtomNode("A", new Point(4, 4), 2, 2);
        expect(cNode.remove(testCenter)).toBeTruthy();
        expect(cNode.children.length).toBe(0);
    });

    test("Removing a childless CutNode one level deep should be successful.", () => {
        cNode.child = new CutNode(new Ellipse(testCenter, 2, 2));
        expect(cNode.remove(testCenter)).toBeTruthy();
        expect(cNode.children.length).toBe(0);
    });

    test("Removing a CutNode with children, but with no children who contain the Point, should not be successful.", () => {
        cNode.child = new AtomNode("B", new Point(8, 8), 1, 1);
        cNode.child = new CutNode(new Ellipse(new Point(5, 2), 0.5, 0.5));
        expect(cNode.remove(testCenter)).toBeFalsy();
    });

    test("Removing a CutNode with children two cut levels deep should be successful.", () => {
        const dee: AtomNode = new AtomNode("D", new Point(4, 4), 2, 2);
        const childCut: CutNode = new CutNode(new Ellipse(testCenter, 4, 4));
        childCut.child = dee;

        cNode.child = childCut;

        expect(cNode.remove(testCenter)).toBeTruthy();
        expect(childCut.children.length).toBe(0);
    });

    test("Removing a CutNode with children several levels deep should be successful.", () => {
        const ell: AtomNode = new AtomNode("L", new Point(4, 4), 1.5, 1.5);
        const childCutThreeDeep: CutNode = new CutNode(new Ellipse(testCenter, 2, 2));
        const childCutTwoDeep: CutNode = new CutNode(new Ellipse(testCenter, 3, 3));
        const childCutOneDeep: CutNode = new CutNode(new Ellipse(testCenter, 4, 4));
        childCutThreeDeep.child = ell;
        childCutTwoDeep.child = childCutThreeDeep;
        childCutOneDeep.child = childCutTwoDeep;
        cNode.child = childCutOneDeep;

        expect(cNode.remove(testCenter)).toBeTruthy();
        expect(childCutThreeDeep.children.length).toBe(0);
    });
});

describe("CutNode clear soliloquy:", () => {
    const cNode: CutNode = new CutNode(testEllipse);

    test("CutNode with no children should have no children after clear call.", () => {
        cNode.clear();
        expect(cNode.children.length).toBe(0);
    });

    cNode.child = new AtomNode("C", origin, 3, 3);

    test("CutNode with one child should have no children after clear call.", () => {
        cNode.clear();
        expect(cNode.children.length).toBe(0);
    });

    cNode.child = new AtomNode("C", origin, 1, 1);
    cNode.child = new AtomNode("P", origin, 3, 3);
    cNode.child = new CutNode(testEllipse);

    test("CutNode with several children should have no children after clear call.", () => {
        cNode.clear();
        expect(cNode.children.length).toBe(0);
    });
});

describe("CutNode toString soliloquy:", () => {
    const sheetNode: CutNode = new CutNode(null);
    test("Sheet of Assertion with no children should produce an appropriate toString.", () => {
        expect(sheetNode.toString()).toStrictEqual("Sheet of Assertion of the AEG Tree");
    });

    const cNode: CutNode = new CutNode(testEllipse);
    cNode.child = new AtomNode("A", new Point(3, 3), 5, 5);
    cNode.child = new CutNode(new Ellipse(new Point(1, 1), 2, 2));

    let expectedString = "A cut node with boundary box of " + cNode.ellipse?.toString();
    expectedString += ", With nested nodes: " + cNode.children.toString();

    test("Regular constructor should produce an appropriate toString.", () => {
        expect(cNode.toString()).toStrictEqual(expectedString);
    });
});

describe("CutNode toFormulaString soliloquy:", () => {
    const sheetNode: CutNode = new CutNode(null);
    test("Sheet of assertion should produce a formula string with only square brackets.", () => {
        expect(sheetNode.toFormulaString()).toStrictEqual("[]");
    });

    test("CutNode should produce an appropriate formula string with children one level deep.", () => {
        const newSheetNode: CutNode = new CutNode(null);
        newSheetNode.child = new CutNode(testEllipse);
        newSheetNode.child = new AtomNode("A", new Point(0, 0), 1, 1);
        expect(newSheetNode.toFormulaString()).toStrictEqual("[() A]");
    });

    test("CutNode should produce an appropriate formula string with children one+ levels deep.", () => {
        const parentCutNode: CutNode = new CutNode(testEllipse);
        parentCutNode.child = new AtomNode("J", new Point(0, 0), 1, 1);
        parentCutNode.child = new CutNode(testEllipse);
        const emptyCutNode: CutNode = new CutNode(testEllipse);
        const childAtomNode: AtomNode = new AtomNode("B", new Point(0, 0), 1, 1);

        const children: (CutNode | AtomNode)[] = [];

        children.push(parentCutNode);
        children.push(emptyCutNode);
        children.push(childAtomNode);

        const cNode: CutNode = new CutNode(testEllipse, children);
        expect(cNode.toFormulaString()).toStrictEqual("((J ()) () B)");
    });
});
