/**
 * @author Ryan Reilly
 */
export class Point {
    public x: number; public y: number;

    constructor(xPos: number, yPos: number) {
        this.x = xPos ?? 0; this.y = yPos ?? 0;
    }
}

export class Rectangle {
    public tl: Point; public tr: Point;
    public bl: Point; public br: Point;

    constructor(topLeft: Point, topRight: Point, botLeft: Point, botRight: Point) {
        this.tl = topLeft  ?? new Point(0,   0);
        this.tr = topRight ?? new Point(10,  0);
        this.bl = botLeft  ?? new Point(0,  10);
        this.br = botRight ?? new Point(10, 10);
    }
}

export class Ellipse {
    public cent: Point;
    public rx: number; public ry: number;

    constructor(center: Point, radX: number, radY, number) {
        this.cent = center ?? new Point(0, 0);
        this.rx = radX ?? 10;
        this.ry = radY ?? 10;
    }
}