import fs from "fs";
import path from "path";

import Imports from "./interfaces/Imports.interface";
import Component from "./Component.class";

class File {
  private transpiledString: string;
  private imports: Imports;

  constructor(fileContentsHtml: Element, imports: Imports) {
    this.transpiledString = this.transpileHtml(fileContentsHtml);
    this.imports = imports;
  }

  public transpileHtml(parentNode: Element): string {
    const transpiledComponent: Component = new Component(parentNode);

    return "";
  }

  public createFile(folderPath: string | null, fileName: string | null) {
    // creates folders
    fs.mkdirSync(folderPath || "", { recursive: true });

    // creates files and contents
    fs.writeFileSync(path.join(folderPath || "", fileName || ""), "hello"); // dummy file content currently, add something
  }
}

export default File;
