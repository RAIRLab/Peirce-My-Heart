
## Preface 
A potential implementation of the AEG Data Structure.
The AEG Tree will be broken up into individual nodes, with each node containing a list of atoms (signiyfing propositions) and a truth value indicating whether the node has a cut.
The node will also have a list of the other nodes nested within this node, to help with building and traversing through the tree structure.

## After meeting 9/1 
### Discussions regarding the data structure design
The group decided on implementing a data structure that consists of individual cut nodes and atom nodes, which represent a cut and atom respectively. The nested linking structure being stored via a list will still be followed. 