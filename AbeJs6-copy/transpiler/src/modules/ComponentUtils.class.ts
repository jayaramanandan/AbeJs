import path from "path";
import Utils from "./Utils.static.class";
import Imports from "./interfaces/Imports.interface";
import Component from "./Component.class";
import ComponentBlueprint from "./ComponentBlueprint.class";

class ComponentUtils {
  public static getImports(
    rootFilePath: string,
    componentHtml: Element | Document
  ): Imports {
    const imports: Imports = {};
    const importsTag: Element = Utils.getElementByTagName(
      componentHtml,
      "imports"
    );

    if (importsTag) {
      Utils.traverseThroughElement(importsTag, {
        "name == IMPORT": (importElement: Element) => {
          // stores the path of the import
          const importSrc: string | null = importElement.getAttribute("src");

          if (importSrc) {
            // compiles imported component
            const importedComponent: ComponentBlueprint =
              new ComponentBlueprint(
                path.join(
                  Utils.getPathStringDetails(rootFilePath).folder,
                  importSrc
                )
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

      importsTag.remove();
    }

    return imports;
  }
}

export default ComponentUtils;
