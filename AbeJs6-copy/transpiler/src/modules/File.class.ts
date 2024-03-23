import fs from "fs";
import path from "path";

import Imports from "./interfaces/Imports.interface";
import Component from "./Component.class";
import ComponentUtils from "./ComponentUtils.class";

class File {
  private transpiledString: string = "";
  private imports: Imports;

  constructor(fileContentsHtml: Element, imports: Imports) {
    this.imports = imports;
    this.transpileHtml(fileContentsHtml);
  }

  public transpileHtml(parentNode: Element): void {
    for (const node of parentNode.childNodes) {
      this.transpiledString += new Component(
        node,
        this.imports,
        ComponentUtils.getFileComponentRules()
      ).getTranspiledHtml();
    }
  }

  public createFile(folderPath: string | null, fileName: string | null) {
    // creates folders
    fs.mkdirSync(folderPath || "", { recursive: true });

    // creates files and contents
    fs.writeFileSync(
      path.join(folderPath || "", fileName || ""),
      this.transpiledString
    ); // dummy file content currently, add something
  }
}

export default File;
