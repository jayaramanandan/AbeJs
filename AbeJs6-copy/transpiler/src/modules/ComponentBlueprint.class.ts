import fs from "fs";

import ComponentUtils from "./ComponentUtils.class";
import Utils from "./Utils.static.class";
import Imports from "./interfaces/Imports.interface";
import PathDetails from "./interfaces/PathDetails.interface";

class ComponentBlueprint {
  private pathDetails: PathDetails;
  private imports: Imports;
  private componentHtml: Element;
  private componentName: string;

  constructor(importPath: string) {
    // splits path
    this.pathDetails = Utils.getPathStringDetails(importPath);

    this.componentHtml = this.getComponentHtml(importPath);

    this.imports = ComponentUtils.getImports(importPath, this.componentHtml);

    this.componentName = this.getName();

    console.log(this.componentName);
  }

  private getComponentHtml(importSrc: string): Element {
    // reads the component's file and converts to html
    return Utils.toHtml(fs.readFileSync(importSrc, "utf8"));
  }

  // @ts-ignore
  public getName(): string {
    const componentTag: Element = Utils.getElementByTagName(
      this.componentHtml,
      "component"
    );

    if (componentTag) {
      const nameAttribute: string | null = componentTag.getAttribute("name");

      if (nameAttribute) return nameAttribute;

      Utils.errorMessage(
        "'Component' tag does not have attribute 'name'",
        this.pathDetails.src
      );
    } else {
      // if the component tag is not defined, the transpiler assumes the component name = file name
      return this.pathDetails.name.toUpperCase();
    }
  }

  private transpileHtml() {}

  private transpileJs() {}
}

export default ComponentBlueprint;
