const Path = require('path');
const FS = require('fs');
const Handler = require('events');
const Gulp = require('gulp');

const Plugin = require('./Plugin');
const Info = require('./Info');
const Reflection = require('pencl-kit/src/Util/Reflection');

module.exports = class Gloom {

  static findRoot() {
    let root = process.cwd();
    while (true) {
      if (FS.existsSync(Path.join(root, 'gulpfile.js'))) {
        return root;
      }
      if (root === Path.join(root, '..')) return null;
      root = Path.join(root, '..');
    }
  }

  constructor(configs = {}) {
    this._configs = configs;
    this._plugins = null;
    this._cwd = Gloom.findRoot();
    this.handler = new Handler();
    this._infos = {};
    this._gulp = Gulp;
  }

  get config() {
    return this._configs;
  }

  path(...args) {
    return Path.join(this._cwd, ...args);
  }

  mkdirs(cwd, ...dirs) {
    let path = cwd;
    for (const dir of dirs) {
      path = Path.join(path, dir);
      if (!FS.existsSync(path)) {
        FS.mkdirSync(path);
      }
    }
  }

  /**
   * @param {string} name 
   * @returns {Plugin}
   */
  getPlugin(name) {
    return this._plugins[name] || null;
  }

  load() {
    if (this._plugins !== null) return;
    this._plugins = {};
    this.checkDeprecation();
    if (this.config.mods && Array.isArray(this.config.mods)) {
      for (const mod of this.config.mods) {
        this.loadMod(mod);
      }
    }
    if (this.config.custom && this.config.custom.tasks) {
      let customTasks = this.config.custom.tasks;
      if (!Path.isAbsolute(customTasks)) {
        customTasks = this.path(customTasks);
      }
      if (FS.existsSync(customTasks)) {
        this.loadDir(customTasks);
      }
    }
    this.handler.emit('loaded', this);
  }

  loadDir(path) {
    if (!FS.existsSync(path)) return;
    const list = FS.readdirSync(path);

    for (const file of list) {
      if (!FS.statSync(Path.join(path, file)).isFile()) continue;
      const Subject = require(Path.join(path, file));
      
      if (Subject.prototype instanceof Plugin) {
        const plugin = new Subject(this, path);

        if (this.config.excludes && this.config.excludes.includes(plugin.plugin)) {
          console.log('Exclude plugin ' + plugin.id);
          continue;
        }
        if (this._plugins[plugin.plugin] !== undefined) {
          console.log('Overwrite ' + this._plugins[plugin.plugin].id + ' with ' + plugin.id);
        }
        this._plugins[plugin.plugin] = plugin;
      }
    }
  }

  loadMod(mod) {
    let info = null;
    try {
      const path = require.resolve(mod, {
        paths: [__dirname, this._cwd],
      });
      info = require(path);
      info.root = Path.dirname(path);
    } catch (e) {
      console.error('Module "' + mod + '" should be load for tasks but has no root "tasks" directory or is not installed.');
      console.error(e);
    }

    try {
      if (typeof info.load === 'function') {
        info.load(this);
        return;
      }
    } catch (e) {
      console.error('Module "' + mod + '" should be load for tasks but has no root "tasks" directory or is not installed.');
      console.error(e);
      return;
    }

    try {
      const path = Path.join(info.root, info.tasks);
      if (path !== null) {
        this.loadDir(path);
      }
    } catch (e) {
      console.error('Module "' + mod + '" should be load for tasks but has no root "tasks" directory or is not installed.');
      console.error(e);
    }
  }

  init() {
    this.handler.emit('init', this);
    this.load();
    for (const name of (this.config.order || [])) {
      this.getPlugin(name).doInit(this._gulp);
    }
    this.initRemaining();
    this.handler.emit('finished', this);
    return this;
  }

  initRemaining() {
    for (const name in this._plugins) {
      this.getPlugin(name).doInit(this._gulp);
    }
    return this;
  }

  /**
   * @param {(string|Plugin)} plugin 
   * @returns {Info}
   */
  getInfo(plugin) {
    if (typeof plugin === 'string') {
      return this._infos[plugin] || null;
    } else {
      if (this._infos[plugin.plugin()] !== undefined) return this._infos[plugin.plugin()];
      this._infos[plugin.plugin()] = new Info(plugin);
      return this._infos[plugin.plugin()];
    }
  }

  checkDeprecation() {
    if (this.deprecation(this.config, 'loadModules', 'DEPRECATED: Please use "mods" instead of "loadModules" in gloom.json')) {
      this.config.mods = this.config.loadModules;
    }
    this.handler.emit('deprecation', this);
  }

  deprecation(config, key, message) {    
    let check = false;
    if (typeof key === 'function') {
      check = key(config);
    } else {
      check = Reflection.getDeep(config, key, undefined) !== undefined;
    }
    if (check) {
      setInterval(() => {
        console.log('\x1b[31m' + '-'.repeat(process.stdout.columns));
        console.log(message);
        console.log('-'.repeat(process.stdout.columns) + '\x1b[0m');
      }, 60000);
    }
    return check;
  }

}
