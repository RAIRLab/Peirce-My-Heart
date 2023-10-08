import {expect, test} from "vitest";

import {Point} from "../src/AEG/Point";

const point = new Point();
const point2 = new Point();

test("Default constructor should make a Point with X = 0.", () => {
    expect(point.x).toBe(0);
});

test("Default constructor should make a Point with Y = 0.", () => {
    expect(point.y).toBe(0);
});

test("Point.toString() should produce a string of the form (x, y).", () => {
    expect(point.toString()).toBe("(0, 0)");
});

point2.set(10, 10);

test("New point via set method should have X = 10.", () => {
    expect(point2.x).toBe(10);
});

test("New point via set method should have Y = 10.", () => {
    expect(point2.y).toBe(10);
});

test("A Point's distance with itself should be 0.", () => {
    expect(point.distance(point)).toBe(0);
});
