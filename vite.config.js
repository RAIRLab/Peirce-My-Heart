/// <reference types="vitest" />

/**
 * @author James Oswald
 */

import {resolve} from 'path';
import {defineConfig} from 'vite';

export default defineConfig(({command, mode}) => {
    let root = "src"
    return {
        root: root,
        base: "/Peirce-My-Heart/",
        publicDir: "../public/",
        build:{
            outDir: "../build",
            emptyOutDir: true,
            rollupOptions:{
                input: resolve(__dirname, root, "index.html"),
            }
        },
        test:{
            include:["../tests/AEGTree/*"]   
        }
    };
})