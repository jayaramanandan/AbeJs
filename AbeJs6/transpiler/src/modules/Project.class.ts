import fs from "fs";
import Utils from "./Utils.static.class";

class Project {
  private projectHtml: Document;
  private projectName: string;
  private rootFilePath: string;

  constructor(rootFilePath: string) {
    this.rootFilePath = rootFilePath;

    // reads root project file and converts string to html
    this.projectHtml = Utils.initialiseDom(
      fs.readFileSync(rootFilePath, "utf8")
    );

    this.projectName = this.getProjectName();

    this.compileProject();
  }

  private getProjectName(): string {
    // gets element with "Project" tag name
    const projectTag: Element = Utils.getElementByTagName(
      this.projectHtml,
      "project"
    );

    // throws an error if no 'project' tag is found
    if (!projectTag)
      Utils.errorMessage(
        `No 'project' tag found. Occurred at (${this.rootFilePath})`
      );

    const nameAttribute: string | null = projectTag.getAttribute("name");

    //throws an error if no 'name' attribute is found
    if (!nameAttribute) {
      Utils.errorMessage(
        `No name attribute found on 'project' tag. Occurred at (${this.rootFilePath})`
      );
      return "";
    }

    return nameAttribute;
  }

  private compileProject(): void {}
}

export default Project;
