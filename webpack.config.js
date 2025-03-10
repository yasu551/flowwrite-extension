const path = require("path");

module.exports = {
  entry: {
    background: path.join(__dirname, "./src/background.js"),
    contentScript: path.join(__dirname, "./src/contentScript.js"),
    sidepanel: path.join(__dirname, "./src/sidepanel.js"),
  },
  output: {
    path: path.join(__dirname, "./"),
    filename: "[name].js",
  },
};
