import path from "path";
import fs from "fs";

import CommandManager from "./modules/CommandManager.class";
import Project from "./modules/Project.class";

const cmd: CommandManager = new CommandManager();

cmd.addDefaultCommand(() => {
  console.log("AbeJs Command Line Tool");
});

cmd.addCommandNotFoundErrorMessage((commandName: string) => {
  console.log(`Error: AbeJs does not recognise the '${commandName}' command.`);
});

cmd.addCommand("run", (filePath: string, ...flags: string[]) => {
  if (!filePath) {
    console.log("Error: no root file path parameter was given.");
    process.exit();
  }

  const rootFilePath = path.join(cmd.getCwd(), filePath);

  if (flags.includes("--clear-cache")) {
    fs.rmSync(path.join(__dirname, "../out"), { recursive: true, force: true });
  }

  const project: Project = new Project(rootFilePath);
});

cmd.executeCommand(process.argv, process.execPath);
