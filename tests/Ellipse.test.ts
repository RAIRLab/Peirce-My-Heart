import {expect, test} from "vitest";

import {Ellipse} from "../src/AEG/Ellipse";
import {Point} from "../src/AEG/Point";

const ellipse = new Ellipse(new Point(0, 0), 5, 5);

//not correct at all. only here because ellipse methods are not implemented yet.
test("Ellipse with center (0, 0) and radii of length 5 should not contain this point.", () => {
    expect(ellipse.containsPoint(new Point(10, 10))).toBe(false);
});
