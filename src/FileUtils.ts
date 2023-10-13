import {AEGTree} from "./AEG/AEGTree";

export function saveFile(tree: AEGTree): string {
    const aegData = JSON.stringify(tree, null, "\t");
    return aegData;
}

export function loadFile(aeg: string | ArrayBuffer | null): AEGTree {
    console.log(typeof aeg);
    if (typeof aeg === "string") {
        const data = JSON.parse(aeg);
        console.log(data);
        return new AEGTree(data.sheet);
    }

    throw new Error("Could not read file properly");
}
