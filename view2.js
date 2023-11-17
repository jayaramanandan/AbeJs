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
      `div[data-component-id='${componentId}']`
    );
    this.children = childrenString;
    this.childrenArray = _getElementFromString(childrenString);
    this.props = propsObject;
    this.props["component"] = this;
    Object.assign(this.props, elementProps);
    if (this.init) this.init();
  }
}
class NAVBAR30636333313430646331303061333533656163343036636337643235613936333839646433356630393838326636633163306435616438316632333832616636 extends _Component {
  constructor(props) {
    super(2, props, `hello this is children string here`, {
      component: undefined,
      pageName: "undefined",
      setPageName: function (newValue) {
        this.pageName = newValue;
        _setVariableTags(this.component.element, this.props.pageName, newValue);
      },
      helloString: "undefined",
      setHelloString: function (newValue) {
        this.helloString = newValue;
        _setVariableTags(
          this.component.element,
          this.props.helloString,
          newValue
        );
      },
      color: "black",
      setColor: function (newValue) {
        this.color = newValue;
        _setVariableTags(this.component.element, this.props.color, newValue);
        _setDynamicAttributes({
          0: {
            Style: `background-color:${this.props.color}; color:${this.color}`,
          },
          1: { "Aria-label": `${this.props.color}` },
        });
      },
    });
  }
  setAttribute(attributeName, newValue) {
    this.props["set" + attributeName](newValue);
  }
  init() {
    this.setCount(0);
    this.setColor("white");
    this.element.onclick = () => {
      console.log("hello");
      this.setCount(this.count + 1);
      if (this.color == "white") {
        this.setColor("black");
      } else {
        this.setColor("white");
      }
    };
  }
  setColor(newValue) {
    this.color = newValue;
    _setVariableTags(this.element, this.color, newValue);
    _setDynamicAttributes({
      0: { Style: `background-color:${this.props.color}; color:${this.color}` },
    });
  }
  setChildren(newValue) {
    this.children = newValue;
    _setVariableTags(this.element, this.children, newValue);
  }
  setCount(newValue) {
    this.count = newValue;
    _setVariableTags(this.element, this.count, newValue);
  }
}
class CARD34333539666638396665323337343237653961316561643831353030393336623966326136333238313465613230363133636665636334666432316231656439 extends _Component {
  constructor(props) {
    super(1, props, ` `, {
      component: undefined,
      front: "undefined",
      setFront: function (newValue) {
        this.front = newValue;
        _setVariableTags(this.component.element, this.props.front, newValue);
      },
    });
  }
  setAttribute(attributeName, newValue) {
    this.props["set" + attributeName](newValue);
  }
}
class APP37353139316431613938393438356461323336373934353866633533653939633964616231656431613566343963313638353264643637633262386331303136 extends _Component {
  constructor(props) {
    super(0, props, ``, {
      component: undefined,
    });
  }
  setAttribute(attributeName, newValue) {
    this.props["set" + attributeName](newValue);
  }
}
var components = {
  component0:
    new APP37353139316431613938393438356461323336373934353866633533653939633964616231656431613566343963313638353264643637633262386331303136(),
  component1:
    new CARD34333539666638396665323337343237653961316561643831353030393336623966326136333238313465613230363133636665636334666432316231656439(),
  component2:
    new NAVBAR30636333313430646331303061333533656163343036636337643235613936333839646433356630393838326636633163306435616438316632333832616636(),
};
