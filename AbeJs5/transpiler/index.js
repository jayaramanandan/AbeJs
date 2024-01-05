const path = require("path");
const chalk = require("chalk");
const { Component } = require("./modules/component");

const commands = {
  _default: () => {
    console.log("AbeJs");
  },

  run: (rootFile) => {
    if (!rootFile) {
      console.log(chalk.bgRed("Error: A root project file must be provided"));
    } else {
      const rootComponent = new Component(
        undefined,
        path.join(process.cwd(), rootFile)
      );

      console.log(rootComponent.imports);
    }
  },

  build: () => {},

  generate: () => {},

  package: () => {},

  unpackage: () => {},
};

let argvIndex = 1;
if (process.argv[0] == process.execPath) {
  argvIndex = 2;
}

const executedCommand = commands[process.argv[argvIndex]];

if (executedCommand) {
  executedCommand(...process.argv.splice(argvIndex + 1));
} else {
  commands["_default"]();
}

// node ../transpiler/index.js run Project.html
