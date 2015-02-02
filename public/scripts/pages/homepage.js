define(function() {

  'use strict';
  console.log(arguments);
  console.log('homepage');

  /**
   * Module dependencies
   */

  var MyComponent = require('components/sample-component');

  /**
   * Module exports
   */

  return initialize;

  /**
   * Module function
   */

  function initialize(config) {
    // MyComponent.attachTo(document);
    console.log('initialize homepage', config);
  }

});