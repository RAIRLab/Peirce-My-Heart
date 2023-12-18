# PeirceMyHeart

[![Code Style: Google](https://img.shields.io/badge/code%20style-google-blueviolet.svg)](https://github.com/google/gts)

PeirceMyHeart is a web application for modeling Charles Peirce's Alpha Existential Graph System,
it allows users to construct and prove theorems using Alpha Existential Graphs. 

## Development

**All listed commands should be run in the project root (Peirce-My-Heart)**

### Documentation

The documentation is deployed with the application and can be accessed [here](https://rairlab.github.io/Peirce-My-Heart/docs/)

### Installing Development Tools

1. Install *Node.js* and *npm*. [Follow the instructions here](https://nodejs.org/en/download)

2. Download all dev dependencies using npm. This command will read all dev
dependencies from `package.json` and install them.
```bash
npm install 
```

### Familiarizing yourself with Development Tools

We use the following development tools: 

1. [**npm**](https://www.npmjs.com/) : npm (node package manager) is a package manager for nodejs projects. We use it exclusively
to install and manage the rest of our nodejs based development dependencies such as typescript, vite, etc.
We also use it to invoke all core development tools via `npm run`.

2. [**Vite**](https://vitejs.dev/) : Vite is an asset bundler and build system for large web projects with 
many types of resources such as typescript. Additionally, it provides excellent debugging features.
We use it as a build system for Typescript, Asset Compressor, and Live Debugger.

3. [**gts**](https://github.com/google/gts) : gts (Google TypeScript Style) is a set of style guidelines and tools for typescript
consistent and readable formatting. It provides defaults for the following tools we use:
    * **eslint** : an extensible linter for javascript and typescript code. It catches 
      many semantic errors such as unused variables.
    * **prettier** : an opinionated code formatter that enforces a code style. It enforces
      syntactic style such as indentation and spacing.

4. [**Vitest**](https://vitest.dev/) : A unit testing framework native to Vite with support for TypeScript. It allows for github workflow compatibility and running numerous tests with one command.

5. [**Playwright**](https://playwright.dev/) : A UI testing framework compatible with Vite with support for TypeScript, similar to other UI testing frameworks such as Selenium. 

## Linting

Lint the code to make sure your code follows all gts style guidelines. To lint gts will invoke eslint and prettier, based
on its defaults and our modifications.
Run the following to get style guideline messages about your code:
```bash
npm run lint
```
Github will prevent you from merging your PR until your code meets style guidelines 
(npm run lint exists with no errors) so it is important to stay on top of this.

gts is a very powerful tool and provides the ability to automatically fix most code
you write to be inline with the projects style guidelines. We invoke it through
```bash
npm run fix
```

## Building
Build the project to the `/dist/` directory using Vite in either development or production mode.
In production mode, all code will be compiled and compressed into a single file to ensure extremely
fast loading of the web page, however debugging will be impossible. To build in production mode
run:
```bash
npm run build
```

In development mode, Vite will include a typescript source map with
the compiled js files, allowing you to seamlessly debug the application in browser. To build in
development mode run:
```bash
npm run build-dev
```

## Debugging

Vite comes bundled with some very powerful debugging tools, the first of which is live
recompilation, during which any edits you make to the source file are immediately compiled 
and changes in the application appear right away in a corresponding web browser window. To 
open a browser window and start listening for changes you can use the following command:
```bash
npm run live-edit
```
Live editing is very cool but if you want to debug you would have to set breakpoints in the browser
debugger which can be annoying. In order to use VS Code debugger while the browser is open is a
two step process. First, launch the Vite development server with:
```bash
npm run vsc-debug
```
Then go to the VS Code debug window and select the "Chrome Vite Debug" configuration and run it
(Other browsers can be supported through the correct VSC extensions). A new chrome window will
open attached to the Vite server, any vs code breakpoints triggered in chrome
will be jumped to in VSC.


## Testing

Test your frontend changes! Playwright will open a UI on a bunch of different browsers and
walk you through the test scripts you write, step by step. Run the following to get started:
```bash
npm run uitest
```
Optionally, if you would like to run your frontend tests headless, or without any UI, run the following:
```bash
npm run uitestHeadless
```
Also, test your "backend" changes! Vitest will help here by looking for all .test.ts files in /tests/AEGTree and running them.
To perform this locally in a terminal, run the following:
```bash
npm run aegtest
```

### Root Files and Folders Overview
```
/.github/ : The code for github workflows this project uses, used for automatically deploying.

/.vscode/ : .json files necessary to use VSCode as a development environment

/public/ : non-code based resources for the application, icons, images, etc.

/src/ : source code for the application.

/tests/ : testing source .test.ts files made with vitest and .spec.ts files made with Playwright.

/.eslintignore : list of .js and .ts files the linter shouldn't look at

/.eslintrc.json : config for the linter, which catches semantic errors in your typescript code.

/.gitignore : list of files and folders shouldn't be uploaded with git version control

/.npmignore : list of the files NPM shouldn't peep

/.prettierrc.js : config for prettier, which catches syntactic errors in your typescript code.

/LICENSE : The legal jargon for who can use and sell the project.

/package-lock.json : NPM record of all  dependencies and sub-dependencies used for this project.

/package.json : main NPM file, contains information about the project and development dependencies.

/playwright.config.js : Playwright configuration

/README.md : the information file you're reading right now.

/tsconfig.json : config for the typescript compiler.

/typedoc.json : Documentation generator configuration

/vite.config.js : Vite build system configuration.

```
