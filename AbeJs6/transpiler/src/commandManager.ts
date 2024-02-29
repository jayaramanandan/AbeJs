class commandManager {
  private commands: { [name: string]: Function } = {};

  public addDefaultCommand(callback: Function) {
    // adds a action when no command name given
    this.commands["_default"] = callback;
  }

  public addCommandNotFoundErrorMessage(callback: Function) {
    this.commands["_notFound"] = callback;
  }

  public addCommand(commandName: string, callback: Function): void {
    if (commandName == "_default") {
      throw new Error(
        "'_default' is not a valid command name, try using the 'addDefaultCommand' function instead."
      );
    } else if (commandName == "_notFound") {
      throw new Error(
        "'_notFound' is not a valid command name, try using the 'addCommandNotFoundErrorMessage' function instead."
      );
    }

    // adds executable commands to commands dictionary
    this.commands[commandName] = callback;
  }

  public executeCommand(processArgs: string[], processExecPath: string): void {
    // should be called when the file is run

    if (this.commands["_default"] == undefined) {
      throw new Error(
        "Default command is not added, use the 'addDefaultCommand' function"
      );
    }
    if (this.commands["_notFound"] == undefined) {
      throw new Error(
        "Not Found command is not added, use the 'addCommandNotFoundErrorMessage' function"
      );
    }

    // stores the index of where the command name is
    let commandNameIndex = processArgs[0] == processExecPath ? 2 : 1;

    if (processArgs[commandNameIndex] == undefined) {
      // executes if no command name provided
      this.commands["_default"]();
    } else if (this.commands[processArgs[commandNameIndex]] == undefined) {
      // executes if command name is not found in list of commands
      this.commands["_notFound"]();
    } else {
      this.commands[processArgs[commandNameIndex]](
        ...processArgs.splice(0, commandNameIndex - 1)
      );
    }
  }
}

export default commandManager;
