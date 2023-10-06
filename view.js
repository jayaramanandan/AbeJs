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
    this.setCount(0);
    this.element.onclick = () => {
      this.setCount(this.count + 1);
      this.props.setPageName("hello");
      this.props.setHelloString("hello string");
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
        helloString: "no wat",
        setHelloString: function (newValue) {
          this.helloString = newValue;
          for (const element of this.element.querySelectorAll(
            "variable[name='this.props.helloString']"
          )) {
            element.innerHTML = newValue;
          }
        },
      },
      `
        <u>stuff</u>
      `
    ),
};
