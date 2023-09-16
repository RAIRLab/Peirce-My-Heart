import {AtomNode} from "./AtomNode";
import {Ellipse} from "./Ellipse";

/**
 * Class that defines a Cut.
 * @author Anusha Tiwari
 * @author Ryan Reilly
 */
export class CutNode {
    /**
     * The ellipse signifying the boundary box of this node.
     */
    ellipse: Ellipse | null; //Null for sheet

    /**
     * Member which contains the list of children nodes nested within this node.
     */
    children: (AtomNode | CutNode)[];

    /**
     * Construct a cut node with given boundary box.
     * @param ellipse The ellipse to be set as the boundary box of this node.
     * @param childList The list of children nodes nested within this node.
     */
    public constructor(ellipse?: Ellipse, childList?: (AtomNode | CutNode)[]) {
        this.ellipse = ellipse ?? new Ellipse();
        this.children = childList ?? [];
    }

    /**
     * Method that returns a string representation of a cut node
     * @returns The children and boundary box of this node
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

    /**
     * Method that checks whether a point is contained within this node.
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
     * Method that checks whether a node is within this cut node.
     * @param otherNode The node that might be within this cut node.
     * @returns True, if it is within this cut node. Else, false.
     */
    public containsNode(otherNode: AtomNode | CutNode): boolean {
        if (this.ellipse === null) {
            //This CutNode represents the sheet.
            //Everything is within the sheet.
            return true;
        }

        if (otherNode instanceof AtomNode) {
            return this.ellipse.containsShape((otherNode as AtomNode).rect);
        } else {
            //ELLIPSE TO BE IMPLEMENTED ACCURATELY
            return this.ellipse.containsShape((otherNode as CutNode).ellipse as Ellipse);
        }
    }

    /**
     * Method that recursively verifies whether all the children of this cut are within it
     * @returns True, if all the children are within. Else, false
     */
    public verifyCut(): boolean {
        let isValid = true;

        for (let i = 0; i < this.children.length; i++) {
            if (!isValid) {
                return false;
            }

            if (this.ellipse === null) {
                //This CutNode represents the sheet.
                //Everything is within the sheet.
                //Check the children of the sheet
                if (this.children[i] instanceof CutNode) {
                    isValid = (this.children[i] as CutNode).verifyCut();
                }
            }

            isValid = this.containsNode(this.children[i]);

            //If the node is a cut node, check it's children
            if (isValid && this.children[i] instanceof CutNode) {
                isValid = (this.children[i] as CutNode).verifyCut();
            }
        }

        return isValid;
    }

    /**
     * Method that checks whether the given node can be inserted into this cut
     * at a given point without overlapping any bounding boxes.
     * @param incomingNode The node to be inserted.
     * @param insertionPoint The point at which the node must be inserted
     * @returns True, if the node can be inserted. Else, false
     */
    public canInsert(incomingNode: AtomNode | CutNode, insertionPoint: Point): boolean {
        //TO BE IMPLEMENTED??

        const isValid = true;
        
        return isValid;
    }

    /**
     * Method that inserts a given node into this cut at a given point.
     * @param incomingNode The node to be inserted
     * @param insertionPoint The point at which the node should be inserted
     */
    public insert(incomingNode: AtomNode | CutNode, insertionPoint: Point): void {
        //TO BE IMPLEMENTED??
    }

    /**
     * Removes the node containing this coordinate
     * @param incomingPoint The point indicating the node that must be removed
     * @returns True, if the node was sucessfully removed. Else, false
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
}
