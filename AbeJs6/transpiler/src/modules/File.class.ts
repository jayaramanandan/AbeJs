import fs from "fs";
import path from "path";

import Imports from "./interfaces/Imports.interface";

class File {
  private transpiledString: string;
  private imports: Imports;

  constructor(fileContentsHtml: Element, imports: Imports) {
    this.transpiledString = this.transpileHtml(fileContentsHtml);
    this.imports = imports;
  }

  public transpileHtml(parentNode: Element): string {
    return "";
  }

  public createFile(folderPath: string | null, fileName: string | null) {
    // creates folders
    fs.mkdirSync(folderPath || "", { recursive: true });

    // creates files and contents
    fs.writeFileSync(
      path.join(folderPath || "", fileName || ""),
      fs.readFileSync(path.join(__dirname, "./lorem.txt"), "utf8")
    ); // dummy file content currently, add something
  }
}

export default File;
