module.exports = class Task {

  constructor(dir) {
    this.dir = dir;
    this.loaded = false;
    this._tags = this.tags();
  }

  setTags(tags) {
    this._tags = tags;
  }

  hasTag(tag) {
    return this._tags.includes(tag);
  }

  id() {
    return '[' + this.dir + '::' + this.key() + ']';
  }

  tags() {
    return [];
  }

  defaultConfig() {
    return {};
  }

  /**
   * @param {import('./index')} manager 
   */
  init(manager) {
    this.manager = manager;
    if (!this.loaded) {
      const defaultConfig = this.defaultConfig();

      for (const key in defaultConfig) {
        if (manager.config[key] === undefined) {
          manager.config[key] = defaultConfig[key];
        }
      }

      this.task(manager.config, manager);
      this.loaded = true;
    }
  }

  key() {
    throw BadMethodCallException('The "key" method needs to be implemented in ' + this.constructor.name);
  }

  /**
   * @param {object} config 
   * @param {import('./index')} manager 
   */
  task(config, manager) {
    throw BadMethodCallException('The "task" method needs to be implemented in ' + this.constructor.name);
  }
  
}