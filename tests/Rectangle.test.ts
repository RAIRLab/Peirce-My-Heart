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
    ])("Constructions with top left vertex (0, 0), w = %i, h = %i should throw errors.", (w, h) => {
        new Rectangle(new Point(0, 0), w, h);
    });
});

describe("Rectangle getCorners soliloquy:", () => {
    const rect1 = new Rectangle(new Point(0, 0), 0, 0);

    test("Rectangle of top left vertex (0, 0) and {w, h} = 0 should have all (0, 0) corners.", () => {
        expect(rect1.getCorners()).toStrictEqual([
            new Point(0, 0),
            new Point(0, 0),
            new Point(0, 0),
            new Point(0, 0),
        ]);
    });

    const rect2 = new Rectangle(new Point(0, 0), 10, 10);

    test("Rectangle of top left vertex (0, 0) and {w, h} = 10 should have apt corners.", () => {
        expect(rect2.getCorners()).toStrictEqual([
            new Point(0, 0),
            new Point(10, 0),
            new Point(10, 10),
            new Point(0, 10),
        ]);
    });
});

describe("Rectangle containsPoint soliloquy:", () => {
    const rect: Rectangle = new Rectangle(new Point(0, 0), 10, 10);

    test.each([
        [2.5, 5],
        [5, 2.5],
        [7.561231231231213, 4.12783918264],
    ])("Rectangle of TL vertex (0, 0), {w, h} = 10 should contain Point (%f, %f).", (x, y) => {
        expect(rect.containsPoint(new Point(x, y))).toBeTruthy();
    });

    test.each([
        [0, 0],
        [0, 10],
        [10, 0],
        [10, 10],
        [0, 5],
        [5, 0],
        [10, 5],
        [5, 10],
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
    ])("Rectangle of TL vertex (0, 0), {w, h} = 10 should not contain Point (%f, %f).", (x, y) => {
        expect(rect.containsPoint(new Point(x, y))).toBeFalsy();
    });
});

describe("Rectangle overlaps soliloquy:", () => {
    const rect: Rectangle = new Rectangle(new Point(0, 0), 10, 10);
    test("Rectangle of TL vertex (0, 0) and {w, h} = 10 should not overlap Rectangle of TL vertex (11, 11) and {w, h} = 10.", () => {
        expect(rect.overlaps(new Rectangle(new Point(11, 11), 10, 10))).toBeFalsy();
    });

    test.each([
        [0, 0, 10, 10], //rectangle with the same measurements
        [10, 10, 10, 10], //rectangle sharing one point in common
        [0, 0, 0, 10], //rectangle sharing one edge in common
        [5, 5, 5, 5], //rectangle starting inside of and crossing through the existing one
        [-5, -5, 5, 5], //rectangle starting outside and crossing through the existing one
    ])(
        "Rectangle of TL vertex(0, 0) and {w, h} = 10 should overlap with Rectangle of TL vertex (%f, %f) and w = %f, h %f.",
        (x, y, w, h) => {
            expect(rect.overlaps(new Rectangle(new Point(x, y), w, h))).toBeTruthy();
        }
    );
});

describe("Rectangle contains soliloquy:", () => {
    const rect: Rectangle = new Rectangle(new Point(0, 0), 10, 10);

    test("A Rectangle of TL vertex (0, 0) and {w, h} = 10 should not contain a Rectangle with the same measurements.", () => {
        expect(rect.contains(new Rectangle(new Point(0, 0), 10, 10))).toBeFalsy();
    });

    test.each([
        [0, 0, 0, 0], //essentially just Points that exist on the existing Rectangle's corners
        [10, 0, 0, 0],
        [0, 10, 0, 0],
        [10, 10, 0, 0],
        [5, 5, 5, 5], //begins inside the existing Rectangle but touches that Rectangle's bounds from inside
        [-5, -5, 5, 5], //begins outside the existing Rectangle but touches that Rectangle's bounds from outside
    ])(
        "Rectangle of TL vertex (0, 0) and {w, h} = 10 should not contain Rectangle of TL vertex (%f, %f) and w = %f, h = %f.",
        (x, y, w, h) => {
            expect(rect.contains(new Rectangle(new Point(0, 0), w, h))).toBeFalsy();
        }
    );

    test.each([
        [1, 1, 1, 1], //standard cases
        [9.9, 9.9, 0.05, 0.05],
        [9.9, 1, 0.05, 0.05],
        [1, 9.9, 0.05, 0.05],
    ])(
        "Rectangle of TL vertex (0, 0) and {w, h} = 10 should contain Rectangle of TL vertex (%f, %f) and w = %f, h = %f.",
        (x, y, w, h) => {
            expect(rect.contains(new Rectangle(new Point(x, y), w, h))).toBeTruthy();
        }
    );
});

describe("Rectangle toString soliloquy:", () => {
    const rect: Rectangle = new Rectangle(new Point(0, 0), 10, 10);

    const properOutput = "Rectangle with top left vertex at: (0, 0), w: 10, h: 10";

    test(
        "Rectangle with TL vertex (0, 0) and {w, h} = 10 should produce a toString of the form " +
            properOutput +
            ".",
        () => {
            expect(rect.toString()).toStrictEqual(properOutput);
        }
    );
});
