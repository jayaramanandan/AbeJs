"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class CommandManager {
    constructor() {
        this.commands = {};
    }
    addDefaultCommand(callback) {
        // adds a action when no command name given
        this.commands["_default"] = callback;
    }
    addCommandNotFoundErrorMessage(callback) {
        this.commands["_notFound"] = callback;
    }
    addCommand(commandName, callback) {
        if (commandName == "_default") {
            throw new Error("'_default' is not a valid command name, try using the 'addDefaultCommand' function instead.");
        }
        else if (commandName == "_notFound") {
            throw new Error("'_notFound' is not a valid command name, try using the 'addCommandNotFoundErrorMessage' function instead.");
        }
        // adds executable commands to commands dictionary
        this.commands[commandName] = callback;
    }
    getCwd() {
        return process.cwd();
    }
    executeCommand(processArgs, processExecPath) {
        // should be called when the file is run
        if (this.commands["_default"] == undefined) {
            throw new Error("Default command is not added, use the 'addDefaultCommand' function");
        }
        if (this.commands["_notFound"] == undefined) {
            throw new Error("Not Found command is not added, use the 'addCommandNotFoundErrorMessage' function");
        }
        // stores the index of where the command name is
        let commandNameIndex = processArgs[0] == processExecPath ? 2 : 1;
        if (processArgs[commandNameIndex] == undefined) {
            // executes if no command name provided
            this.commands["_default"]();
        }
        else if (this.commands[processArgs[commandNameIndex]] == undefined) {
            // executes if command name is not found in list of commands
            this.commands["_notFound"](processArgs[commandNameIndex]);
        }
        else {
            this.commands[processArgs[commandNameIndex]](...processArgs.splice(commandNameIndex + 1, processArgs.length));
        }
    }
}
exports.default = CommandManager;
