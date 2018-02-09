import test from 'ava';
import * as path from 'path';
import { Extracter } from '../dist/index';
import output from './helpers/output-expectation';

test('typescript projects', async (t) => {
  let extracter = new Extracter({
    dir: path.join(__dirname, 'fixtures', 'typescript-project'),
    pagesDir: 'guides',
    sourceDirs: [ 'src' ],
    projectName: 'typescript-project',
    projectVersion: '1.0.0'
  });
  let result = extracter.extract();
  t.deepEqual(result, output('ts'));
});