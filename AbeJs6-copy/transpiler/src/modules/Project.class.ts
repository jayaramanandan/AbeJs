import fs from "fs";
import path from "path";

import Utils from "./Utils.static.class";
import FileStructure from "./interfaces/FileStructure.interface";
import Imports from "./interfaces/Imports.interface";
import ComponentUtils from "./ComponentUtils.class";
import Component from "./Component.class";

class Project {
  private projectHtml: Document;
  private projectName: string;
  private rootFilePath: string;
  private fileStructureDetails: FileStructure;
  private imports: Imports;

  constructor(rootFilePath: string) {
    this.rootFilePath = rootFilePath;

    // reads root project file and converts string to html
    this.projectHtml = Utils.initialiseDom(
      fs.readFileSync(rootFilePath, "utf8")
    );

    this.projectName = this.getProjectName();

    this.fileStructureDetails = this.getFileStructureDetails();

    // starts progress bar - bar uses number of out files as total
    console.log(`Compiling ${this.projectName}...`);
    Utils.startProgressBarCmd(this.fileStructureDetails.numberOfFiles);

    this.imports = ComponentUtils.getImports(
      this.rootFilePath,
      this.projectHtml
    );

    this.compileProject();

    Utils.stopProgressBarCmd();
  }

  private getProjectName(): string {
    // gets element with "Project" tag name
    const projectTag: Element = Utils.getElementByTagName(
      this.projectHtml,
      "project"
    );

    // throws an error if no 'project' tag is found
    if (!projectTag)
      Utils.errorMessage("No 'Project' component found.", this.rootFilePath);

    const nameAttribute: string | null = projectTag.getAttribute("name");

    //throws an error if no 'name' attribute is found
    if (!nameAttribute) {
      Utils.errorMessage(
        "No name attribute found on 'Project' component",
        this.rootFilePath
      );
      return "";
    }

    return nameAttribute;
  }

  private getFileStructureDetails(): FileStructure {
    const fileStructureComponent: Element = Utils.getElementByTagName(
      this.projectHtml,
      "FILESTRUCTURE"
    );

    if (!fileStructureComponent)
      Utils.errorMessage(
        "No 'FileStructure' component found",
        this.rootFilePath
      );

    return {
      fileStructureComponent,
      numberOfFiles: fileStructureComponent.getElementsByTagName("FILE").length,
    };
  }

  private compileProject(): void {
    Utils.traverseThroughElement(
      this.fileStructureDetails.fileStructureComponent,
      ComponentUtils.getProjectComponentRules(this.rootFilePath, this.imports)
    );

    /*
    new Component(
      this.fileStructureDetails.fileStructureComponent,
      this.imports,
      ComponentUtils.getProjectComponentRules(this.rootFilePath, this.imports)
    );*/

    /*
    Utils.traverseThroughElement(
      this.fileStructureDetails.fileStructureComponent,
      {
        "name == FOLDER": (folderComponent: Element) => {
          const folderPath: string | null =
            folderComponent.getAttribute("path");

          if (!folderPath)
            Utils.errorMessage(
              "'Folder' component does not have 'path' attribute.\n" +
                folderComponent.outerHTML,
              this.rootFilePath
            );

          // appends parent folder component path to current folder component path
          let parentPath = "";
          if (
            folderComponent.parentElement &&
            folderComponent.parentElement.tagName == "FOLDER"
          ) {
            parentPath =
              "" &&
              folderComponent.parentElement.getAttribute("data-full-path");
          }

          folderComponent.setAttribute(
            "data-full-path",
            path.join(parentPath, folderPath || "")
          );
        },

        "name == FILE": (fileComponent: Element) => {
          const fileName: string | null = fileComponent.getAttribute("name");

          if (!fileName)
            Utils.errorMessage(
              "'File' component does not have 'name' attribute.\n" +
                fileComponent.outerHTML,
              this.rootFilePath
            );

          if (
            fileComponent.parentElement &&
            fileComponent.parentElement.tagName != "FOLDER"
          ) {
            Utils.errorMessage(
              "'File' component must be within a 'Folder' component.\n" +
                fileComponent.outerHTML,
              this.rootFilePath
            );
          }

          // creates out files

          new File(fileComponent, this.imports).createFile(
            path.join(
              __dirname,
              "../../out",
              fileComponent.parentElement?.getAttribute("data-full-path") || ""
            ),
            fileName
          );

          // increments progress bar every time an out file is created
          Utils.addProgressToBarCmd(1);
        },
      }
    );*/
  }
}

export default Project;
