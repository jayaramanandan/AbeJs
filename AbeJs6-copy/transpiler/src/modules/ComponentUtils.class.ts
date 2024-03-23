import path from "path";
import Utils from "./Utils.static.class";
import Imports from "./interfaces/Imports.interface";
import ComponentBlueprint from "./ComponentBlueprint.class";
import RulesObject from "./interfaces/RulesObject.interface";
import ComponentNode from "./interfaces/ComponentNode.interface";
import File from "./File.class";

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

  public static getProjectComponentRules(
    rootFilePath: string,
    imports: Imports
  ): RulesObject {
    return {
      "name == FOLDER": (folderComponent: Element) => {
        const folderPath: string | null = folderComponent.getAttribute("path");

        if (!folderPath)
          Utils.errorMessage(
            "'Folder' component does not have 'path' attribute.\n" +
              folderComponent.outerHTML,
            rootFilePath
          );

        // appends parent folder component path to current folder component path
        let parentPath = "";
        if (
          folderComponent.parentElement &&
          folderComponent.parentElement.tagName == "FOLDER"
        ) {
          parentPath =
            "" && folderComponent.parentElement.getAttribute("data-full-path");
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
            rootFilePath
          );

        if (
          fileComponent.parentElement &&
          fileComponent.parentElement.tagName != "FOLDER"
        ) {
          Utils.errorMessage(
            "'File' component must be within a 'Folder' component.\n" +
              fileComponent.outerHTML,
            rootFilePath
          );
        }

        // creates out files

        new File(fileComponent, imports).createFile(
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
    };
  }

  public static getFileComponentRules(): RulesObject {
    return {
      "*": (node: ComponentNode) => {},

      "name == #text": (element: ComponentNode) => {
        return element.textContent;
      },

      "hasValidName == true": (element: ComponentNode) => {
        return element.outerHTML;
      },

      "hasValidName == false": (component: ComponentNode) => {
        // executes if the the tag name is a custom component name
        const componentBlueprint: ComponentBlueprint =
          component.referenceComponent.imports[component.tagName];

        return "";
      },
    };
  }
}

export default ComponentUtils;
