import {expect, test} from "vitest";

import {Rectangle} from "../AEG/Rectangle";
import {Point} from "../AEG/Point";

const rect = new Rectangle(new Point(), 0, 0);

test("Rectangle with length = 0 and width = 0 should not contain this point", () => {
    expect(rect.containsPoint(new Point(5, 5))).toBe(false);
});
