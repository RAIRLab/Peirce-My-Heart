import {describe, expect, test} from "vitest";

import {Point} from "../src/AEG/Point";

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

describe("Point distance series:", () => {
    test("A Point's distance with itself should be 0.", () => {
        expect(point.distance(point)).toBe(0);
    });

    test("A Point (0, 0)'s distance with a Point (20, 20) should be sqrt(800)", () => {
        expect(point.distance(point2)).toBe(Math.sqrt(800));
    });
});
