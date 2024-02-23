class CommandLine {
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
    executeCommand(processArgs, processExecPath) {
        // should be called when the file is run

        if(this.commands["_default"] == undefined) {
            throw new Error("A default command must be added, use the ''")
        }

        // stores the index of where the command name is
        let commandNameIndex = processArgs[0] == processExecPath ? 2 : 1;
        if (processArgs[commandNameIndex] == undefined) {
            // executes if no command name provided
            this.commands["_default"]();
        }
        else if (this.commands[processArgs[commandNameIndex]] == undefined) {
            // executes if command name is not found in list of commands
            this.commands["_notFound"]();
        }
        else {
            this.commands[processArgs[commandNameIndex]](...processArgs.splice(0, commandNameIndex - 1));
        }
    }
}
exports.default = CommandLine;
