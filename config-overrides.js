/* config-overrides.js */

module.exports = function override(config, env) {
    let RuleToAdd = { test: /.html$/, loader: "html-loader", options: {minimize: true} };
    config.module.rules.push(RuleToAdd);
    return config;
  }
