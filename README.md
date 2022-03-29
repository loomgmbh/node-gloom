
---
**ABANDONED - DO NOT USE**

This project has moved to https://gitlab.loom.de/loom/node-modules/gloom 

---

# Quick Install

Zum installieren führe folgenden Befehl aus:

`npm install https://github.com/loomgmbh/node-gloom-plugin.git`

# How to use

gulpfile.js

```js
const GloomPlugin = require('gloom-plugin');

const manager = new GloomPlugin('./tasks', require('./config.json'));
manager.init();
```

plugin.js

```js
const gulp = require('gulp');

module.exports = function(config, manager) {

  ...
  gulp.task('plugin') ...
  ...

}
```
