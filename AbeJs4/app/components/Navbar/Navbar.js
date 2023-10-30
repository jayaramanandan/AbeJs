function init() {
  this.setCount(0);
  this.element.onclick = () => {
    this.setCount(this.count + 1);
    this.props.setPageName("hello string");
  };
}
