(function(global) {

  var map = {
    'app': 'app',
  };

  var packages = {
    'app': { main: 'main.js',  defaultExtension: 'js' }
  };

  var config = {
    map: map,
    packages: packages
  }

  // filterSystemConfig - index.html's chance to modify config before we register it.
  if (global.filterSystemConfig) { global.filterSystemConfig(config); }

  System.config(config);

})(this);
