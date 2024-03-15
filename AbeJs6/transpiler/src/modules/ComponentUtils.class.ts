import path from "path";
import Utils from "./Utils.static.class";
import Imports from "./interfaces/Imports.interface";
import Component from "./Component.class";

class ComponentUtils {
  public getImports(rootFilePath: string, importsTag: Element): Imports {
    const imports: Imports = {};

    if (importsTag) {
      Utils.traverseThroughElement(importsTag, {
        "name == IMPORT": (importElement: Element) => {
          // stores the path of the import
          const importSrc: string | null = importElement.getAttribute("src");

          if (importSrc) {
            // compiles imported component
            const importedComponent: Component = new Component(
              path.join(rootFilePath, importSrc)
            );

            // adds import
            imports[importedComponent.getName()] = importedComponent;
          } else {
            Utils.errorMessage(
              "'src' attribute not found on import tag",
              rootFilePath
            );
          }
        },
      });
    }

    return imports;
  }
}

export default ComponentUtils;
