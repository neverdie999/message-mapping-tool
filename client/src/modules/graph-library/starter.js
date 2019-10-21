import MainMgmt from './main-mgmt/main-mgmt.js';

class Starter {
  constructor() {
    this.initialize();
  }

  initialize() {
    /**
     * Init Main Mgmt
     * @type {MainMgmt}
     */
    new MainMgmt();
  }
}

new Starter();