# deps-analyzer
analyse entry module's dependencies with extension supported

# Usage

```javascript
  
  const depsWithContext = new depsAnalyzer('index.js',{
  extensions: ['.js', '.jsx'],
  fileSystem: fs,
  context: path.resolve(__dirname, 'fixtures')
  });

```

