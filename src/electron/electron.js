/**
 * @author James Oswald
 * The Electron Main File, runs as the master Node.js process
 * Manages the application window.
 */

// eslint-disable-next-line
const {app, BrowserWindow} = require("electron");
const path = require("path");
const url = require("url");

function createWindow() {
    // Create the browser window.
    const win = new BrowserWindow({
        width: 800,
        height: 600,
    });

    // load index.html
    win.loadURL(
        url.format({
            pathname: path.join(__dirname, "index.html"),
            protocol: "file:",
            slashes: true,
        })
    );
}

app.on("ready", createWindow);
