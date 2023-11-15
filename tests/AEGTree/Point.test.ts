import {describe, expect, test} from "vitest";
import {Point} from "../../src/AEG/Point";

/**
 * Contains comprehensive unit tests on the Point class.
 * @author Ryan Reilly
 */
let point: Point;
describe("Point constructor soliloquy: ", () => {
    point = new Point(0, 0);

    test.each([
        [10, 10, "(10, 10)"],
        [-10, 10, "(-10, 10)"],
        [10, -10, "(10, -10)"],
        [-10, -10, "(-10, -10)"],
        [10.1, 10.1, "(10.1, 10.1)"],
        [-10.1, 10.1, "(-10.1, 10.1)"],
        [10.1, -10.1, "(10.1, -10.1)"],
        [-10.1, -10.1, "(-10.1, -10.1)"],
    ])("Should create a Point with (%f, %f).", (x, y, expectedString) => {
        point = new Point(x, y);
        expect(point.toString()).toBe(expectedString);
    });

    test.fails.each([
        [NaN, NaN],
        [Infinity, Infinity],
        [-Infinity, Infinity],
        [Infinity, -Infinity],
        [-Infinity, -Infinity],
    ])("All these constructions should throw an error.", (x, y) => {
        point = new Point(x, y);
    });
});

describe("Point set soliloquy:", () => {
    const point2 = new Point(0, 0);
    test.each([
        [10, 10, "(10, 10)"],
        [-10, 10, "(-10, 10)"],
        [10, -10, "(10, -10)"],
        [-10, -10, "(-10, -10)"],
        [10.1, 10.1, "(10.1, 10.1)"],
        [-10.1, 10.1, "(-10.1, 10.1)"],
        [10.1, -10.1, "(10.1, -10.1)"],
        [-10.1, -10.1, "(-10.1, -10.1)"],
    ])("Should set the Point to (%f, %f).", (x, y, expectedString) => {
        point2.set(x, y);
        expect(point2.toString()).toBe(expectedString);
    });

    test.fails.each([
        [NaN, NaN],
        [Infinity, Infinity],
        [-Infinity, Infinity],
        [Infinity, -Infinity],
        [-Infinity, -Infinity],
    ])("Set attempt on (%f, %f) should throw an error.", (x, y) => {
        point2.set(x, y);
    });
});

describe("Point distance soliloquy:", () => {
    point = new Point(0, 0);
    test.each([
        [point, point, 0],
        [point, new Point(10, 10), Math.sqrt(200)],
        [point, new Point(-10, 10), Math.sqrt(200)],
        [point, new Point(-10, -10), Math.sqrt(200)],
    ])("Distance between %o, %o, should be %i", (p1, p2, expected) => {
        expect(p1.distance(p2)).toBe(expected);
    });
});

describe("Point distance soliloquy (float):", () => {
    point = new Point(0, 0);
    test.each([
        [point, new Point(0.00000000000001, 0.000000000001), 0],
        [point, new Point(-0.00000000001, -0.0000000000001), 0],
        [point, new Point(-0.0000000000001, -0.0000000000001), 0],
        [point, new Point(0.0000000000000000000000000000000000000000000001, 0.000000000000001), 0],
    ])("Distance between %o, %o, should be nearly %i", (p1, p2, expected) => {
        expect(p1.distance(p2)).toBeCloseTo(expected);
    });
});
