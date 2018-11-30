const path = require('path');
const matchRequire = require('match-require');
const fs = require('fs');

class DepsAnalyzer {

  constructor(entry, options) {
    this.options = Object.assign({
      extensions: ['', '.js', '.jsx'],
      fileSystem: fs,
      context: process.cwd()
    }, options);
    const context = this.options.context;
    this.deps = {};
    this.matchAllFile = this.matchAllFile.bind(this);
    this.matchFile = this.matchFile.bind(this);
    if (typeof entry === 'string') {
      this.matchFile(context, entry);
    } else if (Array.isArray(entry)) {
      this.matchAllFile(context, entry);
    } else if (typeof entry === 'object') {
      const entries = [];
      Object.keys(entry).forEach(entryKey => {
        const entryPaths = entry[entryKey];
        if (Array.isArray(entryPaths)) {
          entryPaths.forEach(entryPath => {
            entries.push(entryPath);
          })
        } else {
          entries.push(entryPaths);
        }
      })
      this.matchAllFile(context, entries);
    }
    this.unique();

  }

  matchFile(context, filePath) {
    const {
      fileSystem = fs,
      extensions = [],
    } = this.options;
    extensions.unshift('');
    let resolvedFilePath;
    for (let extension of extensions) {
      try {
        resolvedFilePath = require.resolve(path.resolve(context, filePath));
        break;
      } catch (e) {}
      try {
        resolvedFilePath = path.resolve(context, filePath) + extension;
        fileSystem.readFileSync(resolvedFilePath);
        break;
      } catch (e) {}
      try{
        resolvedFilePath = path.resolve(context, filePath, `index${extension}`);
        fileSystem.readFileSync(resolvedFilePath);
        break;
      }catch (e) {}
    }
    if (this.deps[resolvedFilePath]) {
      return;
    }
    const fileContent = fileSystem.readFileSync(resolvedFilePath).toString();
    const deps = matchRequire.findAll(fileContent);
    this.deps[resolvedFilePath] = deps
      .filter(mod => !matchRequire.isRelativeModule(mod))
      .map(mod => {
        if (mod.indexOf('@') > -1) {
          return mod.split('/').slice(0, 2).join('/');
        } else {
          return mod.split('/')[0];
        }
      });
    this.matchAllFile(
      path.dirname(resolvedFilePath),
      deps.filter(mod => matchRequire.isRelativeModule(mod))
    )
  }

  matchAllFile(context, filePaths) {
    filePaths.forEach(filePath => {
      this.matchFile(context, filePath);
    })
  }

  unique() {
    const depSet = new Set();
    Object.keys(this.deps).forEach(key => {
      this.deps[key].forEach(dep => {
        depSet.add(dep);
      })
    });
    this.depsArr = Array.from(depSet);
  }
}

module.exports = DepsAnalyzer;
