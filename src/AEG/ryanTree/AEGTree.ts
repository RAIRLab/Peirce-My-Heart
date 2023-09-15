import {AtomNode} from "./AtomicNode";
import {CutNode} from "./Cut";
import {Point, Rectangle, Ellipse} from "./ShapeAndPointClasses";
import {Node} from "./GenericNode";

/**
 * @author Ryan Reilly
 */
export class AEGTree {
    private root: CutNode;

    constructor() {
        let topLeft!:  Point; topLeft.x =  0; topLeft.y =  0;
        let topRight!: Point; topRight.x = 0; topRight.y = 0;
        let botLeft!:  Point; botLeft.x =  0; botLeft.y =  0;
        let botRight!: Point; botRight.x = 0; botRight.y = 0;

        let r!: Rectangle;
        r.tl = topLeft; r.tr = topRight; r.bl = botLeft; r.br = botRight;

        let nodeList!: Node[];  

        this.root = new CutNode(r, nodeList);
    }

    public verifyAEG(): boolean {
        return this.root.verifyAEG();
    }

    public canInsertAEG(incomingNode: Node, insertionPoint: Point): boolean {
        return this.root.canInsert(incomingNode, insertionPoint);
    }

    public insertAEG(incomingNode: Node, insertionPoint: Point): void {
        if(this.canInsertAEG(incomingNode, insertionPoint)) {
            this.root.insert(incomingNode, insertionPoint);
        }
    }

    public remove(incomingPoint: Point): void {
        this.root.remove(incomingPoint);
    }
}