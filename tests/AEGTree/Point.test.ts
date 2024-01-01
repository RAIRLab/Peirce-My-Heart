import {describe, expect, test} from "vitest";
import {Point} from "../../src/AEG/Point";

/**
 * Contains comprehensive unit tests on the Point class.
 *
 * @author Ryan R
 */

const origin: Point = new Point(0, 0);
describe("Point constructor soliloquy: ", () => {
    test.each([
        [10, 10, "(10, 10)"],
        [-10, 10, "(-10, 10)"],
        [10, -10, "(10, -10)"],
        [-10, -10, "(-10, -10)"],
        [10.1, 10.1, "(10.1, 10.1)"],
        [-10.1, 10.1, "(-10.1, 10.1)"],
        [10.1, -10.1, "(10.1, -10.1)"],
        [-10.1, -10.1, "(-10.1, -10.1)"],
    ])(
        "Constructions with positive and negative integers and positive and negative reals should create a Point with (%f, %f).",
        (x, y, expectedString) => {
            expect(new Point(x, y).toString()).toBe(expectedString);
        }
    );

    test.fails.each([
        [NaN, NaN],
        [Infinity, Infinity],
        [-Infinity, Infinity],
        [Infinity, -Infinity],
        [-Infinity, -Infinity],
    ])("Point constructions with NaN and infinities should throw an error.", (x, y) => {
        const point: Point = new Point(x, y);
        point.x = 0; //only so ts doesn't yell at me
    });
});

describe("Point set soliloquy:", () => {
    test.each([
        [10, 10, "(10, 10)"],
        [-10, 10, "(-10, 10)"],
        [10, -10, "(10, -10)"],
        [-10, -10, "(-10, -10)"],
        [10.1, 10.1, "(10.1, 10.1)"],
        [-10.1, 10.1, "(-10.1, 10.1)"],
        [10.1, -10.1, "(10.1, -10.1)"],
        [-10.1, -10.1, "(-10.1, -10.1)"],
    ])("Setters should set the Point's x and y to (%f, %f).", (x, y, expectedString) => {
        expect(new Point(x, y).toString()).toBe(expectedString);
    });

    const pt: Point = new Point(0, 0);
    test.fails.each([
        [NaN, NaN],
        [Infinity, Infinity],
        [-Infinity, Infinity],
        [Infinity, -Infinity],
        [-Infinity, -Infinity],
    ])("Setting NaN and infinities should throw an error.", (x, y) => {
        pt.set(x, y);
    });
});

describe("Point distance soliloquy:", () => {
    test.each([
        [origin, origin, 0],
        [origin, new Point(10, 10), Math.sqrt(200)],
        [origin, new Point(-10, 10), Math.sqrt(200)],
        [origin, new Point(-10, -10), Math.sqrt(200)],
    ])("Calculated distance between %o, %o, should be %i", (p1, p2, expected) => {
        expect(p1.distance(p2)).toBe(expected);
    });
});

describe("Point distance soliloquy (float):", () => {
    test.each([
        [origin, new Point(0.00000000000001, 0.000000000001), 0],
        [origin, new Point(-0.00000000001, -0.0000000000001), 0],
        [origin, new Point(-0.0000000000001, -0.0000000000001), 0],
        [origin, new Point(0.0000000000000000000000000000000000000000000001, 0.000000000000001), 0],
    ])("Calculated distance between %o, %o, should be nearly %i", (p1, p2, expected) => {
        expect(p1.distance(p2)).toBeCloseTo(expected);
    });
});
