function changeElementAttributes(element, attributes) {
  for (var attributeName in attributes) {
    element.setAttribute(attributeName, attributes[attributeName]);
  }
}
var NAVBAR61643236633066613430373535396132363565333263363732663237663939653863383333393030636432666165633636646436663233303966663334393434 =
  /** @class */ (function () {
    function NAVBAR61643236633066613430373535396132363565333263363732663237663939653863383333393030636432666165633636646436663233303966663334393434(
      props
    ) {
      this.element = document.querySelector("div[data-component-id='1']");
      this.componentId = 1;
      this.props = {
        element: this.element,
        color: undefined,
        setColor: function (newValue) {
          this.color = newValue;
          for (
            var _i = 0,
              _a = document.querySelectorAll(
                "variable[name='this.props.color']"
              );
            _i < _a.length;
            _i++
          ) {
            var element = _a[_i];
            element.innerHTML = newValue;
          }
          var tempElement;
          tempElement = this.element.querySelector("[data-element-id='5']");
          tempElement.setAttribute(
            "class",
            "hello, this page color is ".concat(this.color)
          );
        },
      };
      Object.assign(this.props, props);
      if (this.init) this.init();
    }
    return NAVBAR61643236633066613430373535396132363565333263363732663237663939653863383333393030636432666165633636646436663233303966663334393434;
  })();
var APP37353139316431613938393438356461323336373934353866633533653939633964616231656431613566343963313638353264643637633262386331303136 =
  /** @class */ (function () {
    function APP37353139316431613938393438356461323336373934353866633533653939633964616231656431613566343963313638353264643637633262386331303136(
      props
    ) {
      this.element = document.querySelector("div[data-component-id='0']");
      this.componentId = 0;
      this.props = {
        element: this.element,
        color: undefined,
        setColor: function (newValue) {
          this.color = newValue;
          for (
            var _i = 0,
              _a = document.querySelectorAll(
                "variable[name='this.props.color']"
              );
            _i < _a.length;
            _i++
          ) {
            var element = _a[_i];
            element.innerHTML = newValue;
          }
          var tempElement;
          tempElement = this.element.querySelector("[data-element-id='5']");
          tempElement.setAttribute(
            "class",
            "hello, this page color is ".concat(this.color)
          );
        },
      };
      Object.assign(this.props, props);
      if (this.init) this.init();
    }
    return APP37353139316431613938393438356461323336373934353866633533653939633964616231656431613566343963313638353264643637633262386331303136;
  })();
var components = {
  component0:
    new APP37353139316431613938393438356461323336373934353866633533653939633964616231656431613566343963313638353264643637633262386331303136(),
  component1:
    new NAVBAR61643236633066613430373535396132363565333263363732663237663939653863383333393030636432666165633636646436663233303966663334393434(),
};
console.log(this.components["component1"].init);
