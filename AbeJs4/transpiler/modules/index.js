var app = {
  init: (rootSrc) => {
    (async () => {
      return (await new Component().create(rootSrc, true)).html;
    })().then((rootComponent) => {
      console.log(rootComponent);
    });
  },

  componentCount: 0,
};

async function main() {
  app.init("/App.html");
}

main();
