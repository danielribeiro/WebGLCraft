require.paths.push("./lib");
var jasmine = require('jasmine');
var sys = require('sys');

for(var key in jasmine) {
  global[key] = jasmine[key];
}

var isVerbose = true;
var showColors = true;
process.argv.forEach(function(arg){
  switch(arg) {
  case '--color': showColors = true; break;
  case '--noColor': showColors = false; break;
  case '--verbose': isVerbose = true; break;
  }
});

// Have to hack the directory here. not sure why.
jasmine.executeSpecsInFolder(__dirname + '/../javascripts', function(runner, log){
  process.exit(runner.results().failedCount);
}, isVerbose, showColors);
