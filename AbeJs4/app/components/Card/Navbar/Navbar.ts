function init() {
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
