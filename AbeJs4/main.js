const express = require("express");

const { App } = require("./transpiler/index");

const html = new App("/app/App.html").getPageHtml();

const app = express();

app.get("/", (_req, res) => {
  res.send(html);
});

app.listen(5000, () => {
  console.log("server started");
});
