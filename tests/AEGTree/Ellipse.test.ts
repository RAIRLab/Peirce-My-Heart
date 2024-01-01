import {describe, expect, test} from "vitest";
import {Ellipse} from "../../src/AEG/Ellipse";
import {Point} from "../../src/AEG/Point";
import {Rectangle} from "../../src/AEG/Rectangle";

/**
 * Contains comprehensive tests on the Ellipse class.
 *
 * @author Ryan R
 */

const testCenter: Point = new Point(5, 5);
const testEllipse: Ellipse = new Ellipse(testCenter, 5, 5);

describe("Ellipse constructor soliloquy:", () => {
    test.fails.each([
        [-1, 1],
        [1, -1],
        [NaN, NaN],
        [Infinity, Infinity],
        [-Infinity, Infinity],
        [Infinity, -Infinity],
        [-Infinity, -Infinity],
    ])(
        "Constructions with center (10, 10), radX = %f, radY = %f should throw errors.",
        (radX, radY) => {
            new Ellipse(testCenter, radX, radY);
        }
    );
});

describe("Ellipse containsPoint soliloquy:", () => {
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
        expect(testEllipse.containsPoint(new Point(x, y))).toBeFalsy();
    });

    test.each([
        [5, 5], //we want this Ellipse to contain its center
        [6, 6], //arbitrary Points that should be contained within
        [4.3, 4.4],
        [9.9, 4.9],
        [5.1, 5.1],
        [4.9, 9.9],
    ])("Ellipse of center (5, 5), {radX, radY} = 5 should contain Point (%f, %f).", (x, y) => {
        expect(testEllipse.containsPoint(new Point(x, y))).toBeTruthy();
    });
});

describe("Ellipse-on-Rectangle overlaps soliloquy:", () => {
    test.each([
        [10, 5, 0, 0], //Rectangle touching the rightmost point of this Ellipse
        [5, 0, 0, 0], //Rectangle touching the topmost point of this Ellipse
        [5, 10, 0, 0], //Rectangle touching the bottommost point of this Ellipse
        [0, 5, 0, 0], //Rectangle touching the leftmost point of this Ellipse
    ])(
        "Ellipse of center (5, 5) and {radX, radY} = 5 should not overlap with Rectangle of TL vertex (%f, %f) and w = %f, h = %f.",
        (x, y, w, h) => {
            expect(testEllipse.overlaps(new Rectangle(new Point(x, y), w, h))).toBeFalsy();
        }
    );

    test.each([
        [5, 5, 20, 20], //begins inside the Ellipse but touches the Ellipse's bounds from inside
        [-5, -5, 10, 10], //begins outside the Ellipse but touches the Ellipse's bounds from outside
    ])(
        "Ellipse of center (5, 5) and {radX, radY} = 5 should overlap with Rectangle of TL vertex (%f, %f) and w = %f, h = %f.",
        (x, y, w, h) => {
            expect(testEllipse.overlaps(new Rectangle(new Point(x, y), w, h))).toBeTruthy();
        }
    );

    test.each([
        [5, 5, 2, 2], //tiny guys
        [5, 5, 0, 0],
    ])(
        "Ellipse of center (5, 5) and {radX, radY} = 5 should not overlap with Rectangle of TL vertex (%f, %f) and w = %f, h = %f.",
        (x, y, w, h) => {
            expect(testEllipse.overlaps(new Rectangle(new Point(x, y), w, h))).toBeFalsy();
        }
    );
});

describe("Ellipse-on-Ellipse overlaps soliloquy:", () => {
    test("Any Ellipse should overlap an Ellipse with the same measurements.", () => {
        expect(testEllipse.overlaps(testEllipse)).toBeTruthy();
    });

    test.each([
        [testCenter.x + 5, testCenter.y + 5, 1, 1],
        [testCenter.x + 5, testCenter.y - 5, 1, 1],
        [testCenter.x - 5, testCenter.y - 5, 1, 1],
        [testCenter.x - 5, testCenter.y + 5, 1, 1],
    ])(
        "Ellipse of center = (5, 5) and {radX, radY} = 5 should not overlap Ellipse with center (%f, %f) and radX = %f and radY = %f",
        (x, y, radX, radY) => {
            expect(testEllipse.overlaps(new Ellipse(new Point(x, y), radX, radY))).toBeFalsy();
        }
    );

    test.each([
        [testCenter.x, testCenter.y, 10, 10],
        [testCenter.x + 5, testCenter.y + 5, 5, 5],
        [testCenter.x + 5, testCenter.y - 5, 5, 5],
        [testCenter.x - 5, testCenter.y - 5, 5, 5],
        [testCenter.x - 5, testCenter.y + 5, 5, 5],
    ])(
        "Ellipse of center = (5, 5) and {radX, radY} = 5 should overlap Ellipse with center (%f, %f) and radX = %f and radY = %f",
        (x, y, radX, radY) => {
            expect(testEllipse.overlaps(new Ellipse(new Point(x, y), radX, radY))).toBeTruthy();
        }
    );
});

describe("Ellipse-on-Rectangle contains soliloquy:", () => {
    test.each([
        [5, 0, 10, 10], //begins at this Ellipse's topmost Point but top right corner is outside
        [0, 5, 10, 10], //begins at this Ellipse's leftmost Point
        [10, 5, 10, 10], //begins at this Ellipse's rightmost Point
        [5, 10, 10, 10], //begins at this Ellipse's bottommost Point
        [5, 5, 10, 10], //begins at this Ellipse's center but bottom right corner is outside
    ])(
        "Ellipse of center (5, 5) and {radX, radY} = 5 should not contain Rectangle of TL vertex (%f, %f) and w = %f, h = %f.",
        (x, y, w, h) => {
            expect(testEllipse.contains(new Rectangle(new Point(x, y), w, h))).toBeFalsy();
        }
    );

    test.each([
        [5, 5, 1, 1], //arbitrary fellows
        [5, 5, 2, 2],
        [7, 7, 0, 0.3],
    ])(
        "Ellipse of center (5, 5) and {radX, radY} = 5 should contain Rectangle of TL vertex (%f, %f) and w = %f, h = %f.",
        (x, y, w, h) => {
            expect(testEllipse.contains(new Rectangle(new Point(x, y), w, h))).toBeTruthy();
        }
    );
});

describe("Ellipse-on-Ellipse contains soliloquy:", () => {
    test("Any Ellipse should not contain an Ellipse with the same measurements.", () => {
        expect(testEllipse.contains(testEllipse)).toBeFalsy();
    });

    test.each([
        [5, 0, 10, 10], //begins at this Ellipse's topmost Point but top right corner is outside
        [0, 5, 10, 10], //begins at this Ellipse's leftmost Point
        [10, 5, 10, 10], //begins at this Ellipse's rightmost Point
        [5, 10, 10, 10], //begins at this Ellipse's bottommost Point
        [5, 5, 10, 10], //begins at this Ellipse's center but expands outward in all directions
    ])(
        "Ellipse of center (5, 5) and {radX, radY} = 5 should not contain Ellipse of TL vertex (%f, %f) and radX = %f, radY = %f.",
        (x, y, radX, radY) => {
            expect(testEllipse.contains(new Ellipse(new Point(x, y), radX, radY))).toBeFalsy();
        }
    );

    test.each([
        [5, 5, 3, 3], //begins at this Ellipse's center and stays inward
        [2, 2, 0.5, 0.3], //arbitrary guys
        [6, 6, 0.1, 3],
    ])(
        "Ellipse of center (5, 5) and {radX, radY} = 5 should contain Ellipse of TL vertex (%f, %f) and radX = %f, radY = %f.",
        (x, y, radX, radY) => {
            expect(testEllipse.contains(new Ellipse(new Point(x, y), radX, radY))).toBeTruthy();
        }
    );
});

describe("Ellipse toString soliloquy:", () => {
    const expectedString =
        "An ellipse with Center at: (5, 5), Horizontal radius: 5, Vertical radius: 5, Bounding box: Rectangle with top left vertex at: (0, 0), w: 10, h: 10";

    test(
        "Ellipse with center (5, 5) and {radX, radY} = 5 should produce toString " +
            expectedString +
            ".",
        () => {
            expect(testEllipse.toString()).toBe(expectedString);
        }
    );
});
