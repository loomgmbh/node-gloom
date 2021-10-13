module.exports = class Plugin {

  /**
   * @param {import('./index')} manager
   * @param {string} dir 
   */
  constructor(manager, dir) {
    this.manager = manager;
    this.dir = dir;
    this.loaded = false;
  }

  /** @returns {import('./Info')} */
  get info() {
    return this.manager.getInfo(this);
  }

  /** @returns {string} */
  get id() {
    return '[' + this.dir + '::' + this.plugin + ']';
  }

  /**
   * @param {string} event 
   * @param  {...any} args 
   */
  emit(event, ...args) {
    this.manager.handler.emit('plugin:' + event, ...args);
    this.manager.handler.emit('plugin:' + this.plugin + ':' + event, ...args);
  }

  /**
   * @param {string} event 
   * @param {Function} listener 
   */
  on(event, listener) {
    this.manager.handler.on(event, listener);
  }

  /**
   * @param {import('gulp')} Gulp
   */
  doInit(Gulp) {
    if (!this.loaded) {
      const defaultConfig = this.config;
      for (const key in this.manager.config[this.plugin] || {}) {
        defaultConfig[key] = this.manager.config[this.plugin][key];
      }

      this.emit('init', this, defaultConfig);

      Object.defineProperty(this, 'config', {
        value: defaultConfig,
        writable: false,
      });

      this.init();
      this.define();
      this.loaded = true;
    }
  }

  get config() { return {} }

  init() {}

  /** @returns {string} */
  get plugin() {
    throw BadMethodCallException('The "plugin" getter needs to be implemented in ' + this.constructor.name);
  }

  /**
   * @param {import('gulp')} Gulp
   */
  define(Gulp) {
    throw BadMethodCallException('The "define" method needs to be implemented in ' + this.constructor.name);
  }
  
}