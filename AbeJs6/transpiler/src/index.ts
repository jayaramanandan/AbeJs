import CommandManager from "./commandManager";

const cmd: CommandManager = new CommandManager();

cmd.executeCommand(process.argv, process.execPath);
