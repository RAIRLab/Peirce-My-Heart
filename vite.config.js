/**
 * @author James Oswald
 */

import {resolve} from 'path';
import {defineConfig} from 'vite'

export default defineConfig(({command, mode}) => {
    let root = "src/app";
    let outDir = "../../build";
    if (mode === "electron") {
        return {
            root: root,
            publicDir: "../public",
            build:{
                outDir: outDir,
                emptyOutDir: true,
            }
        };
    } else {
        return {
            root: root,
            build:{
                outDir: outDir,
                emptyOutDir: true,
                rollupOptions:{
                    //Paths to the multiple input pages for our application
                    input:{
                        index: resolve(__dirname, root, "index.html"),
                        about: resolve(__dirname, root, "about.html"),
                        homepage: resolve(__dirname, root, "aeg.html")
                    }
                }
            }
        };
    }
})