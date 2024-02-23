import CommandLine from "./commandLine";

const cmd: CommandLine = new CommandLine();

cmd.executeCommand(process.argv, process.execPath);
