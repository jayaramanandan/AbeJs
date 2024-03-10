import fs from "fs";
import path from "path";

class File {
  constructor() {}

  public createFile(folderPath: string | null, fileName: string | null) {
    fs.mkdirSync(folderPath || "", { recursive: true });

    fs.writeFileSync(
      path.join(folderPath || "", fileName || ""),
      fs.readFileSync(path.join(__dirname, "./lorem.txt"), "utf8")
    ); // dummy file content currently, add something
  }
}

export default File;
