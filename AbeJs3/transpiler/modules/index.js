async function main() {
  const app = new App("/", "App.html");

  console.log(document.querySelectorAll("[data-variable-this-name]"));
}

main();
