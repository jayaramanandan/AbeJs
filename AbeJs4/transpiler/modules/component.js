const {
  capitaliseFirstLetter,
  changeInnerHtml,
  changeTagName,
  getElementByTagName,
  getSrcDetails,
  isValidElement,
  sha256,
} = require("../helpers");

const { getLatestApp } = require("./appManager");

class Component {
  app = getLatestApp();
  componentHtml = this.app.document.createElement("div");
  folder = undefined;
  imports = {};

  name = undefined;
  className = undefined;
  js = undefined;
  html = this.app.document.createElement("div");
  props = {};
  componentId = this.app.componentCount;

  constructor(componentImportPath) {
    this.app.componentCount++;

    this.app.components[this.componentId] = this;

    this.html.setAttribute("data-component-id", this.componentId);

    this.importComponentHtml(componentImportPath);

    this.getExternalImports();

    this.html.innerHTML = this.transpileHtml(
      getElementByTagName(this.componentHtml, "structure")
    );

    this.transpileJs();
  }

  importComponentHtml(path) {
    this.componentHtml.innerHTML = this.app.readFile(path);

    this.folder = getSrcDetails(path).folder;

    this.name = getElementByTagName(this.componentHtml, "component")
      .getAttribute("name")
      .toUpperCase();

    this.className = this.name + sha256(path);
  }

  getExternalImports() {
    const importsTag = getElementByTagName(this.componentHtml, "imports");

    if (importsTag) {
      for (const importElement of importsTag.children) {
        const importedComponent = new Component(
          importElement.getAttribute(this.folder + "src")
        );

        this.imports[importedComponent.name] = importedComponent;
      }
    }
  }

  transpileHtml(parent) {
    let transpiledString = "";

    for (const node of parent.childNodes) {
      if (node.nodeName == "#text") {
        transpiledString += node.textContent;
      } else {
        for (const attributeName of node.getAttributeNames()) {
          if (attributeName[0] == "{") {
            if (attributeName[attributeName.length - 1] == "}") {
            } else {
              throw new Error(`
                  ${node.outerHTML}
                  has invalid dynamic attribute: '${attributeName}'
                  `);
            }
          }
        }

        if (node.tagName == "PAGEHEAD") {
          transpiledString += changeInnerHtml(
            changeTagName(node, "head"),
            this.transpileHtml(node)
          ).outerHTML;
        } else if (node.tagName == "PAGEBODY") {
          transpiledString += changeInnerHtml(
            changeTagName(node, "body"),
            this.transpileHtml(node)
          ).outerHTML;
        } else if (isValidElement(node)) {
          transpiledString += changeInnerHtml(
            node,
            this.transpileHtml(node)
          ).outerHTML;
        } else {
          transpiledString += this.imports[node.tagName].html.outerHTML;
        }
      }
    }

    return transpiledString;
  }

  transpileJs() {
    const jsTag = getElementByTagName(this.componentHtml, "js");
    let mainJs = "";

    if (jsTag) {
      const jsSrc = jsTag.getAttribute("src");

      mainJs = jsSrc
        ? this.app.readFile(this.folder + "/" + jsSrc)
        : jsTag.innerHTML;

      mainJs = mainJs.replaceAll("function ", "");
    }

    this.props = {
      color: {
        5: {
          class: "hello, this page color is {this.props.color}",
        },
      },
    };

    this.app.script += `
    class ${this.className} {
      private element: any = document.querySelector("div[data-component-id='${this.componentId}']");
      private componentId: number = ${this.componentId};
      public props: any = {
        element: this.element,
      `;

    for (const propName in this.props) {
      this.app.script += `
      ${propName}: undefined,
      set${capitaliseFirstLetter(propName)}: function(newValue) {
        this.${propName} = newValue;

        for (const element of document.querySelectorAll("variable[name='this.props.${propName}']")) {
          element.innerHTML = newValue;
        }

        let tempElement;
      `;

      for (const elementId in this.props[propName]) {
        this.app.script += `tempElement = this.element.querySelector("[data-element-id='${elementId}']");`;

        for (const dynamicAttributeName in this.props[propName][elementId]) {
          const attributeSetterString = this.props[propName][elementId][
            dynamicAttributeName
          ]
            .replaceAll("{", "${")
            .replaceAll("this.props.", "this.");

          this.app.script += `
          tempElement.setAttribute("${dynamicAttributeName}", \`${attributeSetterString}\`);
          `;
        }
      }

      this.app.script += "},";
    }

    this.app.script += "};";

    this.app.script += `
      constructor(props) {
        Object.assign(this.props, props);

        if (this.init) this.init();
      }

      ${mainJs}
    }
    `;
  }
}

module.exports = Component;
