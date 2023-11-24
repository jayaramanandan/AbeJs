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

const DynamicStringTypes = {
  INHTML: 0,
  INJSPROPSOBJECT: 1,
  INJSCOMPONENTOBJECT: 2,
  INPROPSSTRING: 3,
};

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
  variables = {};

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
        transpiledString += this.replacePropStrings(
          node.textContent,
          DynamicStringTypes.INHTML
        );
      } else {
        for (const attributeName of node.getAttributeNames()) {
          if (attributeName[0] == "{") {
            if (attributeName[attributeName.length - 1] == "}") {
              const insideBracketsAttributeName = attributeName.substring(
                1,
                attributeName.length - 1
              );
              const setterString = this.replacePropStrings(
                node.getAttribute(attributeName),
                DynamicStringTypes.INPROPSSTRING,
                insideBracketsAttributeName
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
                    capitaliseFirstLetter(insideBracketsAttributeName)
                  ] = node.getAttribute(attributeName).replaceAll("{", "${");
                }
              }

              node.removeAttribute(attributeName);
              node.setAttribute(insideBracketsAttributeName, setterString);

              if (!node.getAttribute("data-element-id")) {
                node.setAttribute("data-element-id", this.elementCount);
                this.elementCount++;
              }
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

  replacePropStrings(text, type, attributeName) {
    let inBrackets = false;
    let returnString = "";
    let insideBracketsValue = "";

    for (const character of text) {
      if (character == "{") {
        inBrackets = true;
      } else if (character == "}") {
        // in-html <variable name="this.variableName">[insert variable value here]</variable>
        // in-js-props-object `stuff here boop bap ${this.component.variableName} wow ${this.propName} ok ${this.component.children}`
        // in-js-component-object `stuff here boop bap ${this.variableName} wow ${this.props.propName} ok ${this.children}`
        // in-props-string "stuff stuff [insert variable value here] wow {this.variableName}"

        let variable;
        const variableName = this.getVariableName(insideBracketsValue);

        if (type == 0) {
          if (this.isPropVariable(insideBracketsValue)) {
            variable = this.props[variableName].value;
          } else {
            if (!this.variables[variableName])
              this.variables[variableName] = {};

            variable = "";
          }
        } else if (type == 1) {
          if (this.isPropVariable(insideBracketsValue)) {
            variable = "this." + variableName;
          } else {
            variable = "this.component." + variableName;
          }
        } else if (type == 2) {
          variable = insideBracketsValue.replaceAll("{", "${");
        } else {
          if (this.isPropVariable(insideBracketsValue)) {
            variable = this.props[variableName].value;
          } else {
            variable = insideBracketsValue;

            if (!this.variables[variableName]) {
              this.variables[variableName] = {};
            }
            if (!this.variables[variableName][this.elementCount]) {
              this.variables[variableName][this.elementCount] = {};
            }

            this.variables[variableName][this.elementCount][
              capitaliseFirstLetter(attributeName)
            ] = text.replaceAll("{", "${");
          }
        }

        if (type == 0) {
          returnString += `<variable name="${insideBracketsValue}">${variable}</variable>`;
        } else if (type == 1 || type == 2) {
          returnString += "${" + variable + "}";
        } else {
          returnString += variable;
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

  getVariableName(text) {
    if (this.isPropVariable(text)) {
      return text.substring("this.props.".length);
    } else return text.substring("this.".length);
  }

  isPropVariable(variableName) {
    return variableName.substring(0, "this.props.".length) == "this.props.";
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

  variableSettersObjectToString(variableSettersObject) {
    let script = "{";

    if (variableSettersObject["value"]) {
      delete variableSettersObject["value"];
    }

    for (const elementId in variableSettersObject) {
      script += `"${elementId}": {`;

      for (const dynamicAttributeName in variableSettersObject[elementId]) {
        script += `"${dynamicAttributeName}": \`${variableSettersObject[elementId][dynamicAttributeName]}\``;
      }

      script += "}";
    }

    script += "}";

    return script;
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
    class ${this.className} extends _Component {
      constructor(props) {
        super(${this.componentId}, props, \`${this.childrenString}\`, {
        component: undefined,
      `;

    for (const propName in this.props) {
      console.log(this.props[propName]);
      this.app.script += `
      ${propName}: "${this.props[propName].value}",
      set${capitaliseFirstLetter(propName)}: function(newValue) {
        this.${propName} = newValue;
        _setVariableTags(this.component.element, "this.props.${propName}", newValue);
        ${
          Object.keys(this.props[propName]).length > 1
            ? `
        _setDynamicAttributes(this.component.element, ${this.variableSettersObjectToString(
          this.props[propName]
        )})`
            : ""
        }
      }
      `;
    }

    this.app.script += "})};";

    this.app.script += `
      setAttribute(attributeName, newValue) {
        this.props["set" + attributeName](newValue);
      }

      ${mainJs}
    `;

    for (const variableName in this.variables) {
      this.app.script += `set${capitaliseFirstLetter(variableName)}(newValue) {
        this.${variableName} = newValue;
        _setVariableTags(this.element, "this.${variableName}", newValue);
        ${
          Object.keys(this.variables[variableName]).length != 0
            ? `
        _setDynamicAttributes(this.element, ${this.variableSettersObjectToString(
          this.variables[variableName]
        )})`
            : ""
        }
      }
      `;
    }
  }
}

module.exports = Component;

// jsx
// make dynamic events
// make styles
// make non-frontend
// make
