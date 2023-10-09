import {describe, expect, test} from "vitest";

import {Rectangle} from "../src/AEG/Rectangle";
import {Point} from "../src/AEG/Point";

/**
 * Contains comprehensive tests on the Rectangle class.
 * @author Ryan Reilly
 */

describe("Rectangle constructor soliloquy:", () => {
    const expectedVertex = new Point(0, 0);
    test.each([
        [new Rectangle(new Point(0, 0), 1, 1), expectedVertex],
        [new Rectangle(new Point(0, 0), 5, 5), expectedVertex],
    ])("These constructors should produce a startingVertex of (0, 0).", (r, expectedVertex) => {
        expect(r.startVertex).toStrictEqual(expectedVertex);
    });

    test.each([
        [0, 0],
        [1, 1],
    ])("These constructors should produce a width of %i and height %i.", (w, h) => {
        expect(new Rectangle(new Point(0, 0), w, h).width).toBe(w);
        expect(new Rectangle(new Point(0, 0), w, h).height).toBe(h);
    });

    test.fails.each([
        [-1, 1],
        [1, -1],
        [NaN, NaN],
        [Infinity, Infinity],
        [-Infinity, Infinity],
        [Infinity, -Infinity],
        [-Infinity, -Infinity],
    ])("Constructions with top left vertex (0, 0), w: %i, h: %i should throw errors.", (w, h) => {
        new Rectangle(new Point(0, 0), w, h);
    });
});

describe("Rectangle getCorners soliloquy:", () => {
    const rect1 = new Rectangle(new Point(0, 0), 0, 0);

    test("Rectangle of top left vertex (0, 0) and {l, w} = 0 should have all (0, 0) corners.", () => {
        expect(rect1.getCorners()).toStrictEqual([
            new Point(0, 0),
            new Point(0, 0),
            new Point(0, 0),
            new Point(0, 0),
        ]);
    });
});

describe("Rectangle containsPoint() soliloquy:", () => {
    const rect: Rectangle = new Rectangle(new Point(0, 0), 10, 10);

    test.each([
        [0, 0],
        [0, 10],
        [10, 0],
        [10, 10],
        [0, 5],
        [5, 0],
        [10, 5],
        [5, 10],
        [2.5, 5],
        [5, 2.5],
        [7.561231231231213, 4.12783918264],
    ])("Rectangle of TL vertex (0, 0), w: 10, h: 10 should contain Point (%f, %f).", (x, y) => {
        expect(rect.containsPoint(new Point(x, y))).toBeTruthy();
    });

    test.each([
        [-1, 0],
        [0, -1],
        [0, 11],
        [11, 0],
        [11, 11],
        [0, -0.000000001],
        [-0.00000000001, 0],
        [0, 10.1],
        [10.1, 0],
        [10.1, 10],
        [10, 10.1],
        [10.1, 10],
        [10.1, 10.1],
    ])("Rectangle of TL vertex (0, 0), w: 10, h: 10 should not contain Point (%f, %f).", (x, y) => {
        expect(rect.containsPoint(new Point(x, y))).toBeFalsy();
    });
});
