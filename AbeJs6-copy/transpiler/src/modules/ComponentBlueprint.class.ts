import fs from "fs";

import ComponentUtils from "./ComponentUtils.class";
import Utils from "./Utils.static.class";
import Imports from "./interfaces/Imports.interface";
import PathDetails from "./interfaces/PathDetails.interface";
import Component from "./Component.class";
import RulesObject from "./interfaces/RulesObject.interface";

class ComponentBlueprint {
  private pathDetails: PathDetails;
  private imports: Imports;
  private componentHtml: Element;
  private componentName: string;
  private isDeclaredComponent: boolean = false;

  /* there are two types of components 'declared' and 'implied'

     declared: the component tag is present and the component is declared using html
     implied: the component tag is not present and the component structure is worked out using file contents (no js manipulation involved)
  */

  constructor(importPath: string) {
    // splits path
    this.pathDetails = Utils.getPathStringDetails(importPath);

    this.componentHtml = this.getComponentHtml(importPath);

    this.imports = ComponentUtils.getImports(importPath, this.componentHtml);

    this.componentName = this.getName();

    this.transpileHtml();
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
      this.isDeclaredComponent = true;

      // gets 'name' attribute from 'Component' tag
      const nameAttribute: string | null = componentTag.getAttribute("name");

      if (nameAttribute) return nameAttribute.toUpperCase();

      Utils.errorMessage(
        "'Component' tag does not have attribute 'name'",
        this.pathDetails.src
      );
    } else {
      this.isDeclaredComponent = false;

      // if the component tag is not defined, the transpiler assumes the component name = file name
      return this.pathDetails.name.toUpperCase();
    }
  }

  private transpileHtml(): void {
    // if the component is a 'declared' component, the program uses the structure tag as html to be transpiled
    // if not, the program uses the file conents as html to be transpiled
    const html: Element = this.isDeclaredComponent
      ? Utils.getElementByTagName(this.componentHtml, "structure")
      : this.componentHtml;

    if (this.isDeclaredComponent && !html)
      Utils.errorMessage(
        "No 'Structure' tag present on component",
        this.pathDetails.src
      );

    for (const node of html.childNodes) {
      const transpiledComponent: Component = new Component(
        node,
        this.imports,
        ComponentUtils.getFileComponentRules()
      );
    }
  }

  private transpileJs(): void {}
}

export default ComponentBlueprint;
