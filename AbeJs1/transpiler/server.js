const express = require("express");
const { readFileSync } = require("fs");
const path = require("path");

const configs = JSON.parse(
  readFileSync(path.join(__dirname, "../app", "config.json"), "utf-8")
);
const PORT = configs["port"];

function startServer(port, staticFolders, routes) {
  const app = express();

  for (const folder of staticFolders || []) {
    app.use(
      folder[0],
      express.static(path.join(__dirname, ...folder.splice(1, folder.length)))
    );
  }

  for (const route in routes || {}) {
    if (typeof routes[route] == "function") {
      app.get(route, routes[route]);
    } else {
      app.get(route, (_req, res) => {
        res.send(routes[route].toString());
      });
    }
  }

  app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}/`);
  });
}

startServer(PORT, [["/", "../app"]], {
  "/": readFileSync(path.join(__dirname, "transpiler.html"), "utf-8"),
  "/files": (req, res) => {
    res.sendFile(path.join(__dirname, "../", ...req.query["path"].split("/")));
  },
});
