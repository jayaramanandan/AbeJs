class NAVBAR71c3817ea30587297c53311b3db43cd36f0ed2c5c6cd2487baabd68069012f72 {
  constructor(componentCount, props, childrenString) {
    this.element = document.querySelector(
      "div[data-component-count='" + componentCount + "']"
    );
    this.props = props;
    this.props["element"] = this.element;

    let tempChildrenElement = document.createElement(div);
    tempChildrenElement.innerHTML = childrenString;
    this.children = tempChildrenElement.children;
  }

  init() {}

  setName(newValue) {
    for (const element of this.element.querySelectorAll(
      "variable[name='" + "this.name" + "']"
    )) {
      element.innerHTML = newValue;
    }

    for (const element of document.querySelectorAll(
      "[data-variable-this-name]"
    )) {
      const variableValue = element.getAttribute("data-variable-this-name");
      element.setAttribute("class", `hello ${variableValue} what`);
    }
  }
}
