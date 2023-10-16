import {describe, test, expect} from "vitest";

import {CutNode} from "../src/AEG/CutNode";
import {AtomNode} from "../src/AEG/AtomNode";
import {Ellipse} from "../src/AEG/Ellipse";
import {Point} from "../src/AEG/Point";

const testCenter = new Point(5, 5);

describe("CutNode constructor soliloquy:", () => {
    const cNode: CutNode = new CutNode(new Ellipse(testCenter, 5, 5));

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

describe.skip("CutNode getCurrentCut soliloquy:", () => {
    const cNode: CutNode = new CutNode(new Ellipse(new Point(5, 5), 5, 5));
});

describe.skip("CutNode containsPoint soliloquy:", () => {
    const cNode: CutNode = new CutNode(new Ellipse(new Point(5, 5), 5, 5));
});

describe.skip("CutNode containsNode soliloquy:", () => {
    const cNode: CutNode = new CutNode(new Ellipse(new Point(5, 5), 5, 5));
});

describe.skip("CutNode remove soliloquy:", () => {
    const cNode: CutNode = new CutNode(new Ellipse(new Point(5, 5), 5, 5));
});

describe.skip("CutNode toString soliloquy:", () => {
    const cNode: CutNode = new CutNode(new Ellipse(new Point(5, 5), 5, 5));
});

describe.skip("CutNode toFormulaString soliloquy:", () => {
    const cNode: CutNode = new CutNode(new Ellipse(new Point(5, 5), 5, 5));
});
