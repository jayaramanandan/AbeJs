const path = require("path");
const projectPath = path.join(__dirname, "../../");

let apps = [];

function addApp(app) {
  apps.push(app);
}

function getLatestApp() {
  return apps[apps.length - 1];
}

class App {
  constructor() {
    addApp(this);
    console.log(projectPath);
  }
}

module.exports = { App };
