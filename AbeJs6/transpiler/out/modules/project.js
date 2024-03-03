"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const utils_1 = __importDefault(require("./utils"));
class Project {
    constructor(rootFilePath) {
        // reads root project file and converts string to html
        this.projectHtml = utils_1.default.initialiseDom(fs_1.default.readFileSync(rootFilePath, "utf8"));
        console.log(this.projectHtml.getElementsByTagName("project")[0].innerHTML);
    }
}
exports.default = Project;
