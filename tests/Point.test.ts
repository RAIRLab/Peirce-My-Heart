import {describe, expect, test} from "vitest";

import {Point} from "../src/AEG/Point";

/**
 * Details comprehensive unit tests on the Point class.
 * @author Ryan Reilly
 */

const point = new Point();
const point2 = new Point();

describe("Point constructor series: ", () => {
    test("Default constructor should make a Point with X = 0.", () => {
        expect(point.x).toBe(0);
    });
    test("Default constructor should make a Point with Y = 0.", () => {
        expect(point.y).toBe(0);
    });
    test("Point.toString() should produce a string of the form (x, y).", () => {
        expect(point.toString()).toBe("(0, 0)");
    });

    const point2 = new Point(10, 10);

    test("Two arg constructor [(Point(10, 10)] should make a Point with X = 10.", () => {
        expect(point2.x).toBe(10);
    });
    test("Two arg constructor [(Point(10, 10)] should make a Point with Y = 10.", () => {
        expect(point2.y).toBe(10);
    });
    test("Point.toString() should now produce a string of the form (x, y) with {x, y} = 10.", () => {
        expect(point2.toString()).toBe("(10, 10)");
    });
});

describe("Point set series:", () => {
    point2.set(20, 20);

    test("New point via set method should have X = 20.", () => {
        expect(point2.x).toBe(20);
    });

    test("New point via set method should have Y = 20.", () => {
        expect(point2.y).toBe(20);
    });
});

describe("Point distance series (non float):", () => {
    test.each([
        [point, point, 0],
        [point, new Point(10, 10), Math.sqrt(200)],
        [point, new Point(-10, 10), Math.sqrt(200)],
        [point, new Point(-10, -10), Math.sqrt(200)],
        [point, new Point(NaN, NaN), NaN],
        [point, new Point(Infinity, Infinity), Infinity],
        [point, new Point(-Infinity, Infinity), Infinity],
        [point, new Point(-Infinity, -Infinity), Infinity],
    ])("Distance between %o, %o, should be %i", (p1, p2, expected) => {
        expect(p1.distance(p2)).toBe(expected);
    });
});

describe("Point distance series (float):", () => {
    test.each([
        [point, new Point(0.00000000000001, 0.000000000001), 0],
        [point, new Point(-0.00000000001, -0.0000000000001), 0],
        [point, new Point(-0.0000000000001, -0.0000000000001), 0],
        [point, new Point(0.0000000000000000000000000000000000000000000001, 0.000000000000001), 0],
    ])("Distance between %o, %o, should be nearly %i", (p1, p2, expected) => {
        expect(p1.distance(p2)).toBeCloseTo(expected);
    });
});
