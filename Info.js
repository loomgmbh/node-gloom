module.exports = class Plugin {

  /**
   * @param {import('./Plugin')} plugin 
   */
  constructor(plugin) {
    this.plugin = plugin;
    this.data = {};
  }

  /**
   * @param {string} task 
   * @returns {this}
   */
  addWatcher(task) {
    this.data.watcher = this.data.watcher || [];
    this.data.watcher.push(task);
    return this;
  }
  
}