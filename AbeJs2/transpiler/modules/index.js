var componentsJs = {};
var currentComponentClassName = "";

async function main() {
  const pageHtml = await transpileComponent("", "App.html");
  console.log(componentsJs);

  console.log(pageHtml);
}

main();
