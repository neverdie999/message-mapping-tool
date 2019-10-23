import MainMgmt from './main-mgnt/main-mgmt.js';

class Starter {
  constructor() {
    this.initialize();
  }

  initialize() {
    /**
     * Init MainMgmt
     * @type {MainMgmt}
     */
    new MainMgmt();
  }
}

new Starter();
