const fs = require("fs");
const path = require("path");
const helpers = require("./helpers");

class Component {
  componentHtml;
  srcDetails;
  imports = {};
  rootComponent;
  name;
  className;

  constructor(rootComponent, filePath) {
    this.rootComponent = rootComponent;
    this.srcDetails = helpers.getSrcDetails(filePath);

    this.getComponentHtml();
    this.getComponentNameDetails();
    this.getImports();
  }

  getComponentHtml() {
    this.componentHtml = helpers.toHtml(
      fs.readFileSync(this.srcDetails.src, "utf8")
    );
  }

  getComponentNameDetails() {
    const componentTag = helpers.getElementByTagName(
      this.componentHtml,
      "component"
    );
    if (!componentTag) {
      throw new Error(`No '<component>' tag detected (${this.srcDetails.src})`);
    }

    this.name = componentTag.getAttribute("name").toUpperCase();
    if (!this.name) {
      throw new Error(
        `No 'name' attribute on component ${this.srcDetails.src}`
      );
    }

    this.className = this.name + helpers.sha256(this.srcDetails.src);
  }

  getImports() {
    const importsElement = helpers.getElementByTagName(
      this.componentHtml,
      "imports"
    );

    if (!importsElement) return;

    for (const importTag of importsElement.children) {
      const importSrc = importTag.getAttribute("src");

      if (!importSrc) {
        throw new Error(
          `No 'src' attribute for import (${this.srcDetails.src})`
        );
      }

      const importedComponent = new Component(
        this.rootComponent,
        path.join(this.srcDetails.folder, importSrc)
      );

      this.imports[importedComponent.name] = importedComponent;
    }
  }
}

module.exports = { Component };
