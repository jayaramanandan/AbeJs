import path from "path";
import CommandManager from "./modules/CommandManager.class";
import Project from "./modules/Project.class";

const cmd: CommandManager = new CommandManager();

cmd.addDefaultCommand(() => {
  console.log("AbeJs Command Line Tool");
});

cmd.addCommandNotFoundErrorMessage((commandName: string) => {
  console.log(`Error: AbeJs does not recognise the '${commandName}' command.`);
});

cmd.addCommand("run", (filePath: string) => {
  if (!filePath) {
    console.log("Error: no root file path parameter was given.");
    process.exit();
  }

  const rootFilePath = path.join(cmd.getCwd(), filePath);

  const project: Project = new Project(rootFilePath);
});

cmd.executeCommand(process.argv, process.execPath);
