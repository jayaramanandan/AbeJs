let apps = [];

function addApp(app) {
  apps.push(app);
}

function getLatestApp() {
  return apps[apps.length - 1];
}

module.exports = { addApp, getLatestApp };
