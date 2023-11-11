const {
  capitaliseFirstLetter,
  changeInnerHtml,
  changeTagName,
  getElementByTagName,
  getSrcDetails,
  isValidElement,
  sha256,
  camelCasePropString,
} = require("../helpers");

const { getLatestApp } = require("./appManager");

class Component {
  app = getLatestApp();
  componentHtml = this.app.document.createElement("div");
  folder = undefined;
  imports = {};
  elementCount = 0;

  name = undefined;
  className = undefined;
  js = undefined;
  html = this.app.document.createElement("div");
  props = {};
  componentId = 0;
  childrenString = "";

  constructor(componentImportPath, isRoot) {
    this.componentImportPath = componentImportPath;

    if (isRoot) this.html = this.app.document.createElement("html");

    this.importComponentHtml(componentImportPath);

    this.getExternalImports();

    this.getComponentProps();
  }

  instantiate(componentNode) {
    this.componentId = this.app.componentCount;

    this.app.componentCount++;

    this.app.components[this.componentId] = this;

    for (const attributeName of componentNode.getAttributeNames()) {
      if (attributeName[0] != "{" && attributeName != "data-element-id") {
        this.props[camelCasePropString(attributeName)].value =
          componentNode.getAttribute(attributeName);
      }
    }

    this.childrenString = componentNode.innerHTML;

    this.html.setAttribute("data-component-id", this.componentId);

    this.html.innerHTML = this.transpileHtml(
      getElementByTagName(this.componentHtml, "structure")
    );

    this.transpileJs();

    return this;
  }

  importComponentHtml(path) {
    this.componentHtml.innerHTML = this.app.readFile(path);

    this.folder = getSrcDetails(path).folder;

    this.name = getElementByTagName(this.componentHtml, "component")
      .getAttribute("name")
      .toUpperCase();

    this.className = this.name + sha256(path);
  }

  getComponentProps() {
    for (const attributeName of getElementByTagName(
      this.componentHtml,
      "component"
    ).getAttributeNames()) {
      if (attributeName != "name") {
        this.props[camelCasePropString(attributeName)] = { value: "undefined" };
      }
    }
  }

  getExternalImports() {
    const importsTag = getElementByTagName(this.componentHtml, "imports");

    if (importsTag) {
      for (const importElement of importsTag.children) {
        const importedComponent = new Component(
          this.folder + importElement.getAttribute("src")
        );

        this.imports[importedComponent.name.toUpperCase()] = importedComponent;
      }
    }
  }

  transpileHtml(parent) {
    let transpiledString = "";

    for (const node of parent.childNodes) {
      if (node.nodeName == "#text") {
        transpiledString += this.replacePropStrings(node.textContent);
      } else {
        for (const attributeName of node.getAttributeNames()) {
          if (attributeName[0] == "{") {
            if (attributeName[attributeName.length - 1] == "}") {
              node.setAttribute("data-element-id", this.elementCount);

              const insideBracketsAttributeName = attributeName.substring(
                1,
                attributeName.length - 1
              );
              const setterString = this.replacePropStrings(
                node.getAttribute(attributeName)
              );

              for (const variableName of this.getVariableNamesFromString(
                node.getAttribute(attributeName)
              )) {
                if (
                  variableName.substring(0, "this.props.".length) ==
                  "this.props."
                ) {
                  const propName = variableName.substring("this.props.".length);

                  if (!this.props[propName][this.elementCount])
                    this.props[propName][this.elementCount] = {};

                  this.props[propName][this.elementCount][
                    insideBracketsAttributeName
                  ] = setterString;
                }
              }

              node.removeAttribute(attributeName);
              node.setAttribute(insideBracketsAttributeName, setterString);

              this.elementCount++;
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
          if (!this.imports[node.tagName]) {
            throw new Error(
              `Component with tag name ${node.tagName} is not imported`
            );
          }

          transpiledString +=
            this.imports[node.tagName].instantiate(node).html.outerHTML;
        }
      }
    }

    return transpiledString;
  }

  replacePropStrings(text) {
    let inBrackets = false;
    let returnString = "";
    let insideBracketsValue = "";

    for (const character of text) {
      if (character == "{") {
        inBrackets = true;
      } else if (character == "}") {
        if (insideBracketsValue == "this.children") {
          returnString += this.childrenString;
        } else if (
          insideBracketsValue.substring(0, "this.props.".length) ==
          "this.props."
        ) {
          returnString +=
            this.props[insideBracketsValue.substring("this.props.".length)]
              .value;
        } else {
        }

        inBrackets = false;
        insideBracketsValue = "";
      } else if (inBrackets) {
        insideBracketsValue += character;
      } else if (!inBrackets) {
        returnString += character;
      }
    }

    return returnString;
  }

  getVariableNamesFromString(text) {
    let inBrackets = false;
    let variableName = "";
    let foundVariableNames = {};

    for (const character of text) {
      if (character == "{") {
        inBrackets = true;
      } else if (character == "}") {
        foundVariableNames[variableName] = undefined;
        variableName = "";
        inBrackets = false;
      } else if (inBrackets) {
        variableName += character;
      }
    }

    return Object.keys(foundVariableNames);
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

    this.app.script += `
    class ${this.className} {
      private element: any = document.querySelector("div[data-component-id='${this.componentId}']");
      private componentId: number = ${this.componentId};
      private children: string = \`${this.childrenString}\`;
      private childrenArray:any = (function () {
        const temp = document.createElement("div");
        temp.innerHTML = \`${this.childrenString}\`;
        return temp;
      })();
      public props: any = {
        element: this.element,
      `;

    for (const propName in this.props) {
      this.app.script += `
      ${propName}: "${this.props[propName].value}",
      set${capitaliseFirstLetter(propName)}: function(newValue) {
        this.${propName} = newValue;

        for (const element of document.querySelectorAll("variable[name='this.props.${propName}']")) {
          element.innerHTML = newValue;
        }
      `;

      if (Object.keys(this.props[propName]).length != 0) {
        this.app.script += `
        let tempElement;
        let tempComponentId;
        `;
      }

      for (const elementId in this.props[propName]) {
        if (elementId != "value") {
          this.app.script += `
        tempElement = this.element.querySelector("[data-element-id='${elementId}']");
        const commponentId = tempElement.getAttribute("data-component-id");
        if (commponentId) tempElement = components["component" + componentId];
        `;

          for (const dynamicAttributeName in this.props[propName][elementId]) {
            const attributeSetterString = this.props[propName][elementId][
              dynamicAttributeName
            ]
              .replaceAll("{", "${")
              .replaceAll("this.props.", "this.");

            this.app.script += `
          tempElement.setAttribute("${capitaliseFirstLetter(
            dynamicAttributeName
          )}", \`${attributeSetterString}\`);
          `;
          }
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

      setAttribute(attributeName, newValue) {
        this.props["set" + attributeName](newValue);
      }

      ${mainJs}
    }
    `;
  }
}

module.exports = Component;
