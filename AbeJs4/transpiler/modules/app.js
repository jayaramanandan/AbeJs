const { JSDOM } = require("jsdom");

const Component = require("./component");
const { readFile, getSrcDetails, tsCompile } = require("../helpers");
const { addApp } = require("./appManager");

class App {
  componentCount = 0;
  components = {};
  script = `
  function _getElementFromString(text) {
    const element = document.createElement("div");
    element.innerHTML = text;

    return element;
  }

  function _setVariableTags(parentElement, variableNameString, newValue) {
    for (const element of parentElement.querySelectorAll(
      "variable[name='" + variableNameString + "']"
    )) {
      element.innerHTML = newValue;
    }
  }

  function _setDynamicAttributes(settersObject) {
    for (const elementId in settersObject) {
      tempElement = this.element.querySelector(
        "[data-element-id='" + elementId + "']"
      );
      tempComponentId = tempElement.getAttribute("data-component-id");
      if (tempComponentId)
        tempElement = components["component" + tempComponentId];
  
      for (const attributeName in settersObject[elementId]) {
        tempElement.setAttribute(
          attributeName,
          settersObject[elementId][attributeName]
        );
      }
    }
  }

  class _Component {
    constructor(componentId, childrenString, elementProps, propsObject) {
      this.componentId = componentId;
      this.element = document.querySelector(
        \`div[data-component-id='\${componentId}']\`
      );
      this.children = childrenString;
      this.childrenArray = _getElementFromString(childrenString);
      this.props = propsObject;
      this.props["component"] = this;
      Object.assign(this.props, elementProps);
      if (this.init) this.init();
    }
  }
  
  `;

  constructor(rootSrc) {
    addApp(this);

    const { folder, file } = getSrcDetails(rootSrc);

    this.configs = JSON.parse(readFile(folder + "/" + "config.json"));

    this.document = new JSDOM(readFile(rootSrc)).window.document;

    this.readFile = (src) => readFile(folder + "/" + src);

    this.rootComponent = new Component(file, true).instantiate(
      this.document.createElement("div")
    );

    this.script += "var components = {";

    for (const componentId in this.components) {
      this.script += `component${componentId}: new ${this.components[componentId].className},`;
    }

    this.script += "};";

    this.script = tsCompile(this.script, this.configs["typescript"]);
  }

  getPageHtml() {
    const page = this.document.createElement("html");
    page.innerHTML = this.rootComponent.html.outerHTML;
    page.innerHTML += `<script>${this.script}</script>`;

    return page.outerHTML;
  }
}

module.exports = App;
