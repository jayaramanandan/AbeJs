"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const Utils_static_class_1 = __importDefault(require("./Utils.static.class"));
class Project {
    constructor(rootFilePath) {
        this.rootFilePath = rootFilePath;
        // reads root project file and converts string to html
        this.projectHtml = Utils_static_class_1.default.initialiseDom(fs_1.default.readFileSync(rootFilePath, "utf8"));
        this.projectName = this.getProjectName();
        this.compileProject();
    }
    getProjectName() {
        // gets element with "Project" tag name
        const projectTag = Utils_static_class_1.default.getElementByTagName(this.projectHtml, "project");
        // throws an error if no 'project' tag is found
        if (!projectTag)
            Utils_static_class_1.default.errorMessage(`No 'project' tag found. Occurred at (${this.rootFilePath})`);
        const nameAttribute = projectTag.getAttribute("name");
        //throws an error if no 'name' attribute is found
        if (!nameAttribute) {
            Utils_static_class_1.default.errorMessage(`No name attribute found on 'project' tag. Occurred at (${this.rootFilePath})`);
            return "";
        }
        return nameAttribute;
    }
    compileProject() {
        Utils_static_class_1.default.traverseThroughElement(Utils_static_class_1.default.getElementByTagName(this.projectHtml, "project"), {
            "name == FILE": (node) => {
                console.log(node.getAttribute("name"));
            },
        });
    }
}
exports.default = Project;
