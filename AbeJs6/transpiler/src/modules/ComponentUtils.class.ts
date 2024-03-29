import path from "path";
import Utils from "./Utils.static.class";
import Imports from "./interfaces/Imports.interface";
import ComponentBlueprint from "./ComponentBlueprint.class";

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
            const importedComponent: ComponentBlueprint = new Co(
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
