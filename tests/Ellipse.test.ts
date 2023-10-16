import {describe, expect, test} from "vitest";

import {Ellipse} from "../src/AEG/Ellipse";
import {Rectangle} from "../src/AEG/Rectangle";
import {Point} from "../src/AEG/Point";

describe("Ellipse constructor soliloquy:", () => {
    const center: Point = new Point(10, 10);

    test.fails.each([
        [-1, 1],
        [1, -1],
        [NaN, NaN],
        [Infinity, Infinity],
        [-Infinity, Infinity],
        [Infinity, -Infinity],
        [-Infinity, -Infinity],
    ])(
        "Constructions with top center (10, 10), radX = %f, radY = %f should throw errors.",
        (radX, radY) => {
            new Ellipse(center, radX, radY);
        }
    );
});

describe("Ellipse containsPoint soliloquy:", () => {
    const ell: Ellipse = new Ellipse(new Point(5, 5), 5, 5); //diameters of 10

    test.each([
        [0, 0], //we probably should not have our Ellipses be Rectangles. These would be the corners
        [0, 10],
        [10, 0],
        [10, 10],
        [10, 5], //farthest reaches of this Ellipse
        [0, 5],
        [5, 0],
        [5, 10],
        [100, 100], //arbitrary Points that shouldn't be within
        [200, 200],
    ])("Ellipse of center (5, 5), {radX, radY} = 5 should not contain Point (%f, %f).", (x, y) => {
        expect(ell.containsPoint(new Point(x, y))).toBeFalsy();
    });

    test.each([
        [5, 5], //we want this Ellipse to contain its center
        [6, 6], //arbitrary Points that should be contained within
        [4.3, 4.4],
        [9.9, 4.9],
        [5.1, 5.1],
        [4.9, 9.9],
    ])("Ellipse of center (5, 5), {radX, radY} = 5 should contain Point (%f, %f).", (x, y) => {
        expect(ell.containsPoint(new Point(x, y))).toBeTruthy();
    });
});

describe("Ellipse-on-Rectangle overlaps soliloquy:", () => {
    const ell: Ellipse = new Ellipse(new Point(5, 5), 5, 5); //diameters of 10

    //same logic with Rectangle's overlaps(), touching points along the edge should be overlap
    //set to skip until Ellipse's overlaps, at least from a design choice perspective, are
    //hammered out
    test.skip.each([
        [10, 5, 0, 0], //Rectangle touching the rightmost point of this Ellipse
        [5, 0, 0, 0], //Rectangle touching the topmost point of this Ellipse
        [5, 10, 10, 10], //Rectangle touching the bottommost point of this Ellipse
        [-10, -5, 5, 10], //Rectangle touching the leftmost point of this Ellipse
    ])(
        "Ellipse of center (5, 5) and {radX, radY} = 5 should overlap with Rectangle of TL vertex (%f, %f) and w = %f, h = %f.",
        (x, y, w, h) => {
            expect(ell.overlaps(new Rectangle(new Point(x, y), w, h))).toBeTruthy();
        }
    );

    //this block should be combined with the above block when design decisions are hammered out
    test.each([
        [5, 5, 20, 20], //begins inside the Ellipse but touches the Ellipse's bounds from inside
        [-5, -5, 10, 10], //begins outside the Ellipse but touches the Ellipse's bounds from outside
    ])(
        "Ellipse of center (5, 5) and {radX, radY} = 5 should overlap with Rectangle of TL vertex (%f, %f) and w = %f, h = %f.",
        (x, y, w, h) => {
            expect(ell.overlaps(new Rectangle(new Point(x, y), w, h))).toBeTruthy();
        }
    );

    test.each([
        [5, 5, 2, 2], //tiny guys
        [5, 5, 0, 0],
    ])(
        "Ellipse of center (5, 5) and {radX, radY} = 5 should not overlap with Rectangle of TL vertex (%f, %f) and w = %f, h = %f.",
        (x, y, w, h) => {
            expect(ell.overlaps(new Rectangle(new Point(x, y), w, h))).toBeFalsy();
        }
    );
});

describe("Ellipse-on-Ellipse overlaps soliloquy:", () => {
    const ell: Ellipse = new Ellipse(new Point(5, 5), 5, 5); //diameters of 10

    test("Any Ellipse should overlap an Ellipse with the same measurements.", () => {
        expect(ell.overlaps(ell)).toBeTruthy();
    });
});

describe("Ellipse-on-Rectangle contains soliloquy:", () => {
    const ell: Ellipse = new Ellipse(new Point(5, 5), 5, 5); //diameters of 10

    test.each([
        [5, 0, 10, 10], //begins at the Ellipse's topmost point but top right corner is outside
        [5, 5, 10, 10], //begins at Ellipse's center but bottom right corner is outside
    ])(
        "Ellipse of center (5, 5) and {radX, radY} = 5 should not contain Rectangle of TL vertex (%f, %f) and w = %f, h = %f.",
        (x, y, w, h) => {
            expect(ell.contains(new Rectangle(new Point(x, y), w, h))).toBeFalsy();
        }
    );
});

describe("Ellipse-on-Ellipse contains soliloquy:", () => {
    const ell: Ellipse = new Ellipse(new Point(5, 5), 5, 5); //diameters of 10

    test("Any Ellipse should not contain an Ellipse with the same measurements.", () => {
        expect(ell.contains(new Rectangle(new Point(0, 0), 5, 5))).toBeFalsy();
    });
});

describe("Ellipse toString soliloquy:", () => {
    const ell: Ellipse = new Ellipse(new Point(5, 5), 5, 5);

    const expectedString =
        "An ellipse with Center at: (5, 5), Horizontal radius: 5, Vertical radius: 5, Bounding box: Rectangle with top left vertex at: (0, 0), w: 10, h: 10";

    test(
        "Ellipse with center (5, 5) and {radX, radY} = 5 should produce toString " +
            expectedString +
            ".",
        () => {
            expect(ell.toString()).toBe(expectedString);
        }
    );
});
