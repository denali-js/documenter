import Tree = require('broccoli-plugin');
import Extracter from '../extracter';
import { sync as readPkg } from 'read-pkg'
import * as fs from 'fs';
import * as path from 'path';

export interface ExtracterTreeOptions {
  /**
   * The root directory of the project to extract documentation from
   */
  dir: string;
  /**
   * The path to the directory containing all the Pages to build, relative to `dir`. Defaults to `docs`
   */
  pagesDir?: string;
  /**
   * An array of paths to the directories containing the source code to extract API docs from.
   * Defaults to `src`
   */
  sourceDirs?: string[];
}

export default class ExtracterTree extends Tree {

  options: {
    /**
     * The root directory of the project to extract documentation from
     */
    dir: string;
    /**
     * The path to the directory containing all the Pages to build, relative to `dir`. Defaults to `docs`
     */
    pagesDir: string;
    /**
     * An array of paths to the directories containing the source code to extract API docs from.
     * Defaults to `src`
     */
    sourceDirs: string[];
  };

  projectPkg: {
    name: string;
    version: string;
  };

  constructor(sourceTree: Tree | string, options: ExtracterTreeOptions) {
    super([ sourceTree ]);
    options.sourceDirs = options.sourceDirs || [ 'src' ];
    options.pagesDir = options.pagesDir || 'docs';
    this.options = <any>options;
    this.projectPkg = readPkg(options.dir);
  }

  build() {
    let input = this.inputPaths[0];
    // If docs data was already extracted, just use that
    if (fs.existsSync(path.join(input, 'docs.json'))) {
      let docs = fs.readFileSync(path.join(input, 'docs.json'));
      fs.writeFileSync(path.join(this.outputPath, 'docs.json'), docs);
    } else {
      let extracter = new Extracter({
        projectName: this.projectPkg.name,
        projectVersion: this.projectPkg.version,
        dir: this.options.dir,
        sourceDirs: this.options.sourceDirs.map((dir) => path.join(input, dir)),
        pagesDir: path.join(input, this.options.pagesDir)
      });
      let docs = extracter.extract();
      fs.writeFileSync(path.join(this.outputPath, 'docs.json'), JSON.stringify(docs));
    }
  }

}
