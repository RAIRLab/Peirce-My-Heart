import {describe, test, expect} from "vitest";

import {AtomNode} from "../src/AEG/AtomNode";
import {Rectangle} from "../src/AEG/Rectangle";
import {Point} from "../src/AEG/Point";

/**
 * Contains comprehensive tests on the AtomNode class.
 * @author Ryan Reilly
 */
describe("AtomNode constructor soliloquy:", () => {
    test.fails(
        "AtomNode constructor should fail if the empty string is passed as an argument.",
        () => {
            new AtomNode("", new Point(0, 0), new Rectangle(new Point(0, 0), 0, 0));
        }
    );

    const atom: AtomNode = new AtomNode(
        "F",
        new Point(0, 0),
        new Rectangle(new Point(0, 0), 10, 10)
    );
    test("AtomNode construction with identifier F and Rectangle with TopLeft vertex (0, 0) and {h, w} = 10 should produce accurate apt results.", () => {
        expect(atom.identifier).toBe("F");
        expect(atom.origin).toStrictEqual(new Point(0, 0));
        expect(atom.rectangle).toStrictEqual(new Rectangle(new Point(0, 0), 10, 10));
    });
});

describe("AtomNode containsPoint soliloquy:", () => {
    const atom: AtomNode = new AtomNode(
        "A",
        new Point(0, 0),
        new Rectangle(new Point(0, 0), 10, 10)
    );

    test.each([
        [0, 0], //each of four corners of the bounding box
        [0, 10],
        [10, 0],
        [10, 10],
        [0, 5], //Points on each of the four sides
        [5, 0],
        [5, 10],
        [10, 5],
        [1, 1], //arbitrary Points that should be in here
        [9, 9],
        [7.561231231231213, 4.12783918264],
        [3.1, 4.5],
    ])(
        "AtomNode with Rectangle of TL vertex (0, 0), {w, h} = 10 should contain Point (%f, %f).",
        (x, y) => {
            expect(atom.containsPoint(new Point(x, y))).toBeTruthy();
        }
    );

    test.each([
        [-1, -1], //arbitrary points that should not be in here
        [-1, 10],
        [10, -1],
        [11, 11],
    ])(
        "AtomNode with Rectangle of TL vertex (0, 0), {w, h} = 10 should not contain Point (%f, %f).",
        (x, y) => {
            expect(atom.containsPoint(new Point(x, y))).toBeFalsy();
        }
    );
});

describe("AtomNode toString soliloquy:", () => {
    const tom: AtomNode = new AtomNode("A", new Point(0, 0), new Rectangle(new Point(0, 0), 10, 5)); //this one is tom. like you, he is indivisible. say hello

    const expectedString =
        "An atom representing the proposition: " +
        tom.identifier +
        " and Boundary box of: " +
        tom.rectangle;

    test(
        "Atom with identifier A and default measurements should produce a toString of the form " +
            expectedString +
            ".",
        () => {
            expect(tom.toString()).toStrictEqual(expectedString);
        }
    );
});
