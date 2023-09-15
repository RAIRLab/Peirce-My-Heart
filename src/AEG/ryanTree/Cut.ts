import {Point, Rectangle, Ellipse} from "./ShapeAndPointClasses";
import {Node} from "./GenericNode";
import {AtomNode} from "./AtomicNode";

/**
 * @author Ryan Reilly
 */
export class CutNode extends Node {

    private cutEllipse: Ellipse;

    private childList: Node[];

    constructor(bound: Rectangle, children: Node[]) {
        super(bound);
        this.childList = children ?? [];
    }

    public verifyAEG(): boolean {
        let i: number = 0;
        let isValid: boolean = true;

        while(i < this.childList.length && isValid) {

            if(this.childList[i] instanceof AtomNode) {

                if(!this.fitsWithin(this.childList[i].getBoundBox())) {
                    isValid = false;
                }
            }
            else {
                isValid = (this.childList[i] as CutNode).verifyAEG();
            }
            i++;
        }

        return isValid;
    }

    public canInsert(incomingNode: Node, insertionPoint: Point): boolean {
        let isValid: boolean = true;

        return isValid;
    }

    public insert(incomingNode: Node, insertionPoint: Point): void {

    }

    /**
     * Calls remove on the next CutNode that contains this point.
     * 
     * @param incomingPoint     the incoming Point
     */
    public remove(incomingPoint: Point): void {
        let i: number = 0;

        while(i < this.childList.length) { 
            if(this.childList[i] instanceof CutNode && 
              (this.childList[i] as CutNode).containsPoint(incomingPoint, this.getBoundBox())) {

                if((this.childList[i] as CutNode).getChildList.length === 0) {
                    //this.childList[i] = null;
                }
                else {
                    (this.childList[i] as CutNode).remove(incomingPoint);
                }
            }
            else if(this.childList[i] instanceof AtomNode) {
                if(this.containsPoint(incomingPoint, (this.childList[i] as AtomNode).getBoundBox())) {
                    //this.childList[i] = null; //since these are always leaves
                }
            }
            i++;
         }
    }

    public getChildList(): Node[] {
        return this.childList;
    }

    private containsPoint(incomingPoint: Point, bound: Rectangle): boolean {
        return (incomingPoint.x > bound.tl.x && incomingPoint.x < bound.tr.x) &&
               (incomingPoint.y > bound.tl.y && incomingPoint.y < bound.tr.y);
    }

    private fitsWithin(incomingShape: Rectangle | Ellipse): boolean {
        if (incomingShape instanceof Rectangle) {
            let bound: Rectangle = this.getBoundBox();

            return  (
                    (bound.tl.x > incomingShape.tl.x   && bound.tl.y > incomingShape.tl.y) &&
                    (bound.tr.x > incomingShape.tr.x   && bound.tr.y > incomingShape.tr.y) &&
                    (bound.bl.x > incomingShape.bl.x   && bound.bl.y > incomingShape.bl.y) &&
                    (bound.br.x > incomingShape.br.x   && bound.br.y > incomingShape.br.y)
                    );
        }
        else {
                //handle bounds checking for when we agree on a method for ellipse bounds.
                //n-sided polygon probably?
            return false;
        }
    }
}