function init() {
  this.setCount(0);
  this.element.onclick = () => {
    this.props.setName("hello");
    this.setCount(this.count + 1);
  };
}
