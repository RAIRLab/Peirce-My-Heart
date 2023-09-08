import { Point } from "./Point";

//James - Ideally id prefer all the leters to the same size and only allow cuts to be resized

export class Rectangle {

    /**
     * The starting (top left) vertex of the rectangle.
     */
    private startVertex: Point;

    //bottom left

    /**
     * The width of the rectangle.
     */
    private width: number;

    /**
     * The height of the rectangle.
     */
    private height: number;

    /**
     * Construct a rectangle using the given points and lengths.
     * If no values specified, default them to 0.
     * @param vertex The starting point of the rectangle.
     * @param w The width of the rectangle.
     * @param h The height of the rectangle.
     */
    constructor(vertex?: Point, w?: number, h?: number) {
        this.startVertex = vertex ?? new Point();
        this.width = w ?? 0;
        this.height = w ?? 0;
    }

    /**
     * Accessor to get the top left vertex of the rectangle.
     * @returns The top left vertex of the rectangle.
     */
    public getStartVertex(): Point {
        return this.startVertex;
    }

    /**
     * Modifier to set the top left vertex of the rectangle.
     * @param vertex The point to be set as the top left vertex of the rectangle.
     */
    public setStartVertex(vertex: Point) {
        this.startVertex = vertex;
    }

    /**
     * Accessor to get the width of the rectangle.
     * @returns The width of the rectangle.
     */
    public getWidth(): number {
        return this.width;
    }

    /**
     * Modifier to set the width of the rectangle.
     * @param length The legnth to be set as the width of the rectangle.
     */
    public setWidth(length: number) {
        this.width = length;
    }

    /**
     * Accessor to get the height of the rectangle.
     * @returns The height of the rectangle.
     */
    public getHeight(): number {
        return this.height;
    }

    /**
     * Modifier to set the height of the rectangle.
     * @param length The length to be set as the height of the rectangle.
     */
    public setHeight(length: number) {
        this.height = length;
    }

    /**
     * Returns a string representation of the rectangle
     * @returns The coordinates and lengths for the rectangle
     */
    toString(): string {
        return("A rectangle with\nTop Left Vertex at: " + this.startVertex.toString + ", \n" +
        "Width of: " + this.width + ", \n" + 
        "Height of: " + this.height);
    }
}