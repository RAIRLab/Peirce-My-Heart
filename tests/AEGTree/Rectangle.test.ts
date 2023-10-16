import {describe, expect, test} from "vitest";

import {Rectangle} from "../../src/AEG/Rectangle";
import {Ellipse} from "../../src/AEG/Ellipse";
import {Point} from "../../src/AEG/Point";

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
        [0, 0], //corners
        [0, 10],
        [10, 0],
        [10, 10],
        [0, 5], //edges
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
    ])("Rectangle of TL vertex (0, 0), {w, h} = 10 should contain Point (%f, %f).", (x, y) => {
        expect(rect.containsPoint(new Point(x, y))).toBeFalsy();
    });
});

describe("Rectangle-on-Rectangle overlaps soliloquy:", () => {
    const rect: Rectangle = new Rectangle(new Point(0, 0), 10, 10);
    test("Rectangle of TL vertex (0, 0) and {w, h} = 10 should not overlap Rectangle of TL vertex (11, 11) and {w, h} = 10.", () => {
        expect(rect.overlaps(new Rectangle(new Point(11, 11), 10, 10))).toBeFalsy();
    });

    test.each([
        [0, 0, 10, 10], //Rectangle with the same measurements
        [10, 10, 10, 10], //Rectangle sharing one point in common
        [0, 0, 0, 10], //Rectangle sharing one edge in common
        [5, 5, 5, 5], //Rectangle starting inside of and crossing through the existing one
        [-5, -5, 5, 5], //Rectangle starting outside and crossing through the existing one
    ])(
        "Rectangle of TL vertex(0, 0) and {w, h} = 10 should overlap with Rectangle of TL vertex (%f, %f) and w = %f, h %f.",
        (x, y, w, h) => {
            expect(rect.overlaps(new Rectangle(new Point(x, y), w, h))).toBeTruthy();
        }
    );
});

//skipping until the code determining this is hammered out
describe.skip("Rectangle-on-Ellipse overlaps soliloquy:", () => {
    const rect: Rectangle = new Rectangle(new Point(0, 0), 10, 10);

    //same logic with Rectangle's overlaps(), touching points along the edge should be overlap
    //set to skip until Ellipse's overlaps, at least from a design choice perspective, are
    //hammered out
    test.skip.each([
        [15, 0, 5, 5], //Ellipse touching the top right vertex of this Rectangle
        [-5, 0, 5, 5], //Ellipse touching the top left vertex of this Rectangle
        [-5, 10, 5, 5], //Ellipse touching the bottom left vertex of this Rectangle
        [15, 10, 5, 5], //Ellipse touching the bottom right vertex of this Rectangle
    ])(
        "Rectangle of TL vertex (0, 0) and {w, h} = 10 should overlap with Ellipse of center (%f, %f) and radX = %f, radY = %f.",
        (x, y, radX, radY) => {
            expect(rect.overlaps(new Ellipse(new Point(x, y), radX, radY))).toBeTruthy();
        }
    );

    //this block should be combined with the above block when design decisions are hammered out
    test.skip.each([
        [5, 5, 20, 20], //begins inside the Rectangle but touches the Rectangle's bounds from inside
        [-5, 0, 20, 20], //begins outside the Rectangle but touches the Rectangle's bounds from outside
    ])(
        "Rectangle of TL vertex (0, 0) and {w, h} = 10 should overlap with Ellipse of center (%f, %f) and radX = %f, radY = %f.",
        (x, y, radX, radY) => {
            expect(rect.overlaps(new Ellipse(new Point(x, y), radX, radY))).toBeTruthy();
        }
    );

    test.each([
        [5, 5, 1, 1], //tiny guy
        [5, 5, 20, 20], //huge guy
    ])(
        "Ellipse of center (5, 5) and {radX, radY} = 5 should not overlap with Rectangle of TL vertex (%f, %f) and w = %f, h = %f.",
        (x, y, radX, radY) => {
            expect(rect.overlaps(new Rectangle(new Point(x, y), radX, radY))).toBeFalsy();
        }
    );
});

describe("Rectangle-on-Rectangle contains soliloquy:", () => {
    const rect: Rectangle = new Rectangle(new Point(0, 0), 10, 10);

    test("A Rectangle of TL vertex (0, 0) and {w, h} = 10 should not contain a Rectangle with the same measurements.", () => {
        expect(rect.contains(new Rectangle(new Point(0, 0), 10, 10))).toBeFalsy();
    });

    test.each([
        [0, 0, 0, 0], //essentially just Points that exist on the existing Rectangle's corners
        [10, 0, 0, 0],
        [0, 10, 0, 0],
        [10, 10, 0, 0],
        [10, 10, 10, 10], //shares only the bottom right corner of the existing Rectangle
        [10, 0, 10, 10], //shares just the right side of the existing Rectangle, continues right
        [0, 10, 10, 10], //shares just the bottom of the existing Rectangle, continues down
        [5, 5, 5, 5], //begins inside the existing Rectangle but touches that Rectangle's bounds from inside
        [2, 2, 8, 2],
        [-5, 5, 5, 5], //begins outside the existing Rectangle but touches that Rectangle's bounds from outside
        [-2, 2, 2, 4],
    ])(
        "Rectangle of TL vertex (0, 0) and {w, h} = 10 should not contain Rectangle of TL vertex (%f, %f) and w = %f, h = %f.",
        (x, y, w, h) => {
            expect(rect.contains(new Rectangle(new Point(x, y), w, h))).toBeFalsy();
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

describe("Rectangle-on-Ellipse contains soliloquy:", () => {
    const rect: Rectangle = new Rectangle(new Point(0, 0), 10, 10);

    test.each([
        [0, 0, 5, 5], //should not contain Ellipses whose centers are on corners or edges
        [10, 0, 5, 5],
        [0, 10, 5, 5],
        [10, 10, 5, 5],
        [0, 5, 5, 5],
        [5, 0, 5, 5],
        [10, 5, 5, 5],
        [5, 10, 5, 5],
        //should not contain Ellipses whose farthest points touch corners or edges
        [15, 10, 5, 5], //touches (10, 10) on the Rectangle
        [15, 5, 5, 5], //touches (10, 5) on the Rectangle
        [15, 0, 5, 5], //touches (10, 0) on the Rectangle
        [5, -5, 5, 5], //touches (5, 0) on the Rectangle
        [-5, 0, 5, 5], //touches (0, 0) on the Rectangle
        [-5, 5, 5, 5], //touches (0, 5) on the Rectangle
        [-5, 10, 5, 5], //touches (0, 10) on the Rectangle
        [5, 15, 5, 5], //touches (5, 10) on the Rectangle
    ])(
        "Rectangle of TL vertex (0, 0) and {w, h} = 10 should not contain Ellipse of center (%f, %f) and radX = %f, radY = %f.",
        (x, y, rx, ry) => {
            expect(rect.contains(new Ellipse(new Point(x, y), rx, ry))).toBeFalsy();
        }
    );

    test.each([
        [5, 5, 2, 2], //arbitrary Ellipses that should be contained within the Rectangle
        [9.9, 9.9, 0, 0],
        [0.1, 0.1, 0.01, 0.01],
        [9.9, 0.1, 0.001, 0.001],
        [0.1, 9.9, 0.0001, 0.0001],
    ])(
        "Rectangle of TL vertex (0, 0) and {w, h} = 10 should not contain Ellipse of center (%f, %f) and radX = %f, radY = %f.",
        (x, y, rx, ry) => {
            expect(rect.contains(new Ellipse(new Point(x, y), rx, ry))).toBeTruthy();
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
