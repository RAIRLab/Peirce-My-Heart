/**
 * Contains comprehensive tests on the AtomNode class.
 *
 * @author Ryan R
 */
import {describe, expect, test} from "vitest";

import {AtomNode} from "../../src/AEG/AtomNode";
import {Point} from "../../src/AEG/Point";

const atom: AtomNode = new AtomNode("A", new Point(0, 10), 10, 10);

describe("AtomNode constructor soliloquy:", () => {
    const pt: Point = new Point(0, 0);

    test.fails.each([
        [""],
        ["00"],
        ["      "],
        ["Call me Ishmael. Some time ago, never mind how long precisely, "],
        ["SPLIT YOUR LUNGS WITH BLOOD AND THUNDER... WHEN YOU SEE THE WHITE WHALE!"],
    ])("Construction with identifiers not of length 1 should fail.", val => {
        new AtomNode(val, pt, 0, 0);
    });

    test.fails.each([["1"], ["."], [" "], ["Б"], ["ц"]])(
        "Construction with identifier %s not in the English alphabet should fail.",
        val => {
            new AtomNode(val, pt, 0, 0);
        }
    );

    test("AtomNode construction with identifier A and Rectangle with TL vertex (0, 10) and {h, w} = 10 should produce accurate apt results.", () => {
        expect(atom.identifier).toBe("A");
        expect(atom.origin).toStrictEqual(new Point(0, 10));
        expect(atom.width).toBe(10);
        expect(atom.height).toBe(10);
    });
});

describe("AtomNode containsPoint soliloquy:", () => {
    test.each([
        [1, 1], //Arbitrary Points that should be in here
        [9, 9],
        [7.561231231231213, 4.12783918264],
        [3.1, 4.5],
    ])(
        "AtomNode with Rectangle of BL vertex (0, 10), {w, h} = 10 should contain Point (%f, %f).",
        (x, y) => {
            expect(atom.containsPoint(new Point(x, y))).toBeTruthy();
        }
    );

    test.each([
        [0, 0], //Each of four corners of the bounding box
        [0, 10],
        [10, 0],
        [10, 10],
        [0, 5], //Points on each of the four sides
        [5, 0],
        [5, 10],
        [10, 5],
        [-1, -1], //Arbitrary points that should not be in here
        [-1, 10],
        [10, -1],
        [11, 11],
        [200, -12398],
        [-12390, 43],
    ])(
        "AtomNode with Rectangle of BL vertex (0, 10), {w, h} = 10 should not contain Point (%f, %f).",
        (x, y) => {
            expect(atom.containsPoint(new Point(x, y))).toBeFalsy();
        }
    );
});

describe("AtomNode toString soliloquy:", () => {
    const atom: AtomNode = new AtomNode("A", new Point(0, 10), 10, 10);
    const expectedString: string =
        "An atom representing the proposition: " +
        atom.identifier +
        " and Boundary box of: " +
        atom.calcRect().toString();

    test(
        "Atom with identifier A and default measurements should produce a toString of the form " +
            expectedString +
            ".",
        () => {
            expect(atom.toString()).toStrictEqual(expectedString);
        }
    );
});
