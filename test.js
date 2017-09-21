const fs = require('fs');
const Extracter = require('./dist/extracter').default

let extracter = new Extracter({
  projectName: 'denali',
  projectVersion: '0.0.32',
  dir: '/Users/daw/oss/denali/denali',
  pagesDir: 'guides',
  sourceDirs: [ 'lib' ]
});
fs.writeFileSync('test-result.json', JSON.stringify(extracter.extract()));
