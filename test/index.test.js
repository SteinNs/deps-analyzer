const fs = require('fs');
const path = require('path');
const depsAnalyzer = require('../index');

const deps = new depsAnalyzer(path.resolve(__dirname,'fixtures/index.js'),{
  extensions: ['.js', '.jsx'],
  fileSystem: fs,
});
console.log(deps.depsArr);