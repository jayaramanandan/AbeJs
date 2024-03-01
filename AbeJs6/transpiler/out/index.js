"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const commandManager_1 = __importDefault(require("./modules/commandManager"));
const cmd = new commandManager_1.default();
cmd.addDefaultCommand(() => {
    console.log("AbeJs Command Line Tool");
});
cmd.addCommandNotFoundErrorMessage((commandName) => {
    console.log(`Error: AbeJs does not recognise the '${commandName}' command.`);
});
cmd.addCommand("run", (filePath) => {
    if (!filePath) {
        console.log("Error: no root file path parameter was given.");
        process.exit();
    }
    const rootFilePath = path_1.default.join(cmd.getCwd(), filePath);
});
cmd.executeCommand(process.argv, process.execPath);
