function stringToHtml(htmlString) {
  const tempElement = document.createElement("div");
  tempElement.innerHTML = htmlString;

  return tempElement.children;
}

class Component {
  constructor(componentId, props, childrenString) {
    this.element = document.querySelector(
      "div[data-component-id='" + componentId + "']"
    );
    this.children = stringToHtml(childrenString);
    this.props = props;
    this.props["element"] = this.element;

    this.init();
  }
}

class NAVBARf548caff2b9662845baaa0981d14664755e1c0dc4eda52ecb7aeb48c7b6d831b extends Component {
  constructor(...args) {
    super(...args);
  }

  init() {
    this.setCount(1);
    this.element.onclick = () => {
      this.props.setName("hello");
      this.setCount(this.count + 1);
    };
  }

  setCount(newValue) {
    this.count = newValue;
    for (const element of this.element.querySelectorAll(
      "variable[name='this.count']"
    )) {
      element.innerHTML = newValue;
    }
  }
}
var components = {
  component0:
    new NAVBARf548caff2b9662845baaa0981d14664755e1c0dc4eda52ecb7aeb48c7b6d831b(
      0,
      {
        name: "no wat",
        setName: function (newValue) {
          this.name = newValue;

          for (const element of this.element.querySelectorAll(
            "variable[name='this.props.name']"
          )) {
            element.innerHTML = newValue;
          }
        },
      },
      `
        <h4>hello</h4>
      `
    ),
};
