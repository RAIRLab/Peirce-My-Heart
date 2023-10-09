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

    test.fails.each([
        [-1, 1],
        [1, -1],
        [NaN, NaN],
        [Infinity, Infinity],
        [-Infinity, Infinity],
        [Infinity, -Infinity],
        [-Infinity, -Infinity],
    ])("Rectangle constructions of vertex (0, 0), w: %i, h: %i throw errors.", (w, h) => {
        new Rectangle(new Point(0, 0), w, h);
    });
});
