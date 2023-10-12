import {AEGTree} from "./AEG/AEGTree";

export function saveFile(tree: AEGTree) {
    const aegData = JSON.stringify(tree);
    const fileData = "data:text/json;charset=utf-8," + encodeURIComponent(aegData);
    console.log("A: ", aegData);
    console.log("F: ", fileData);
}

export function loadFile() {}
