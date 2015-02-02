'use strict';

requirejs.config({
  // baseUrl: 'bower_components',
  paths: {
    'flight': '/vendor/flight/lib',
    'jquery': '/vendor/jquery/dist/jquery'
  }
});

define(
  [
    'flight/compose',
    'flight/registry',
    'flight/advice',
    'flight/logger',
    'flight/debug',
    'jquery'
  ],

  function(compose, registry, advice, withLogging, debug) {
  console.log(',', this);
  debug.enable(true);
    compose.mixin(registry, [advice.withAdvice]);
    console.log('Huge is hiring. http://www.hugeinc.com/careers');
  }
);