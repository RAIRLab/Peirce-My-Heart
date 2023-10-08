import {AtomNode} from "./AtomNode";
import {Ellipse} from "./Ellipse";
import {Point} from "./Point";

/**
 * Class that defines a Cut in AEGTree.
 * @author Anusha Tiwari
 * @author Ryan Reilly
 * @author James Oswald
 */
export class CutNode {
    /**
     * The boundary of this node.
     */
    ellipse: Ellipse | null; //Null for sheet of assertion

    /**
     * Contains the list of child nodes nested within this node.
     */
    children: (AtomNode | CutNode)[];

    /**
     * Constructs a CutNode with the incoming Ellipse as its boundary box.
     * @param ellipse The ellipse to be set as the boundary box of this node.
     * @param childList The list of children nodes nested within this node.
     */
    public constructor(ellipse?: Ellipse, childList?: (AtomNode | CutNode)[]) {
        this.ellipse = ellipse ?? new Ellipse();
        this.children = childList ?? [];
    }

    /**
     * Determines the deepest CutNode in which newNode can fit.
     * @param newNode the new node
     * @returns the deepest valid CutNode in which newNode can fit
     */
    public getCurrentCut(newNode: CutNode | AtomNode): CutNode {
        for (let i = 0; i < this.children.length; i++) {
            let child : CutNode | AtomNode = this.children[i];
            if (child instanceof CutNode && this.children[i].containsNode(newNode)) {
                //======DEBUGGG=======
                console.log("current cut: " + this.children[i]);
                //newNode can be placed at least one layer deeper
                return child.getCurrentCut(newNode);
            }
        }
        return this; //we are at the deepest valid level that newNode can be placed
    }

    /**
     * Checks whether the incoming Point is contained within this CutNode.
     * @param otherPoint The point that might be within this node.
     * @returns True, if the point is within this node. Else, false.
     */
    public containsPoint(otherPoint: Point): boolean {
        if (this.ellipse === null) {
            //This CutNode represents the sheet.
            //Everything is within the sheet.
            return true;
        }

        return this.ellipse.containsPoint(otherPoint);
    }

    /**
     * Checks whether another node is within this CutNode.
     * @param otherNode The node that might be within this CutNode.
     * @returns True, otherNode it is within this CutNode. Else, false.
     */
    public containsNode(otherNode: AtomNode | CutNode): boolean {
        if (this.ellipse === null) {
            //This CutNode represents the sheet.
            //Everything is within the sheet.
            return true;
        }

        if (otherNode instanceof AtomNode) {
            return this.ellipse.containsShape(otherNode.rect);
        } else if(otherNode instanceof CutNode) {
            //ELLIPSE TO BE IMPLEMENTED ACCURATELY
            return this.ellipse.containsShape(otherNode.ellipse as Ellipse);
        }
        else {
            throw Error("containsNode expected AtomNode or CutNode")
        }
    }

    /**
     * Removes the node lowest on the tree containing the incoming Point.
     * @param incomingPoint The incoming Point
     * @returns True, if the node was successfully removed. Else, false
     */
    public remove(incomingPoint: Point): boolean {
        if (this.containsPoint(incomingPoint)) {
            let isSmallest = true;

            for (let i = 0; i < this.children.length; i++) {
                //Check if the point is within a child
                if (this.children[i].containsPoint(incomingPoint)) {
                    isSmallest = false;

                    if (this.children[i] instanceof CutNode) {
                        //If the point is within a cut node, check its children
                        return (this.children[i] as CutNode).remove(incomingPoint);
                    } else {
                        //If the point is within an atom node, remove it
                        this.children = this.children.splice(i, 1);
                        return true;
                    }
                }
            }
            //if the point is not contained within any children nodes, delete this node
            if (isSmallest) {
                //What to do to remove this node?
                return true;
            }
        }

        return false;
    }

    /**
     * Returns a string representation of this CutNode.
     * @returns The children and boundary box of this CutNode.
     */
    public toString(): string {
        let str: string;

        if (this.ellipse === null) {
            str = "Sheet of Assertion of the AEG Tree";
        } else {
            str = "A cut node with boundary box of \n" + this.ellipse.toString();
        }

        if (this.children.length > 0) {
            str += ", \n" + "With nested nodes: " + this.children.toString();
        }
        return str;
    }

    public toFormulaString(): string {
        let formulaString = ""
        for(let child of this.children){
            if (child instanceof AtomNode){
                formulaString += child.identifier;
            } else if(child instanceof CutNode){
                formulaString += child.toFormulaString();
            }
            formulaString += " "
        }
        formulaString = formulaString.slice(0, -1);
        if(this.ellipse == null){
            formulaString = "[" + formulaString + "]";
        }else{
            formulaString = "(" + formulaString + ")";
        }
        return formulaString;
    }
}
