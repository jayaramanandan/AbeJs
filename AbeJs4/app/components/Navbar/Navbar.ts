function init(): void {
  this.element.onclick = () => {
    this.props.setColor("hello string");
  };
}
