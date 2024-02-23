"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commandLine_1 = __importDefault(require("./commandLine"));
const cmd = new commandLine_1.default();
cmd.executeCommand(process.argv, process.execPath);
