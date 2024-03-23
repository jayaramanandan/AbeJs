<<<<<<< HEAD:AbeJs6/transpiler/src/commandManager.ts
class commandManager {
=======
class CommandManager {
>>>>>>> f1f13d9c7c8cebbb5852fb4b9ec90e55e668b340:AbeJs6/transpiler/src/modules/CommandManager.class.ts
  private commands: { [name: string]: Function } = {};

  public addDefaultCommand(callback: Function): void {
    // adds a action when no command name given
    this.commands["_default"] = callback;
  }

  public addCommandNotFoundErrorMessage(callback: Function): void {
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

  public getCwd(): string {
    return process.cwd();
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
      this.commands["_notFound"](processArgs[commandNameIndex]);
    } else {
      this.commands[processArgs[commandNameIndex]](
        ...processArgs.splice(commandNameIndex + 1, processArgs.length)
      );
    }
  }
}

<<<<<<< HEAD:AbeJs6/transpiler/src/commandManager.ts
export default commandManager;
=======
export default CommandManager;
>>>>>>> f1f13d9c7c8cebbb5852fb4b9ec90e55e668b340:AbeJs6/transpiler/src/modules/CommandManager.class.ts
