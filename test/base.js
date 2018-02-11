import test from 'ava';
import * as path from 'path';
import { Extracter } from '../dist/index';
import output from './helpers/output-expectation';

test('allow non-existent pages directory', async (t) => {
  let extracter = new Extracter({
    dir: path.join(__dirname, 'fixtures', 'missing-pages-dir'),
    pagesDir: 'guides',
    sourceDirs: [ 'src' ],
    projectName: 'javascript-project',
    projectVersion: '1.0.0'
  });
  let result = extracter.extract();
  t.deepEqual(result, Object.assign(output('js'), { pages: {} }));
});