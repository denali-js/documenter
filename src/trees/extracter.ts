import Tree = require('broccoli-plugin');
import Extracter from '../extracter';
import fs from 'fs';
import path from 'path';

export interface ExtracterTreeOptions {
  /**
   * The path to the directory containing all the Pages to build, relative to `dir`. Defaults to `docs`
   */
  pagesDir?: string;
  /**
   * An array of paths to the directories containing the source code to extract API docs from.
   * Defaults to `src`
   */
  sourceDirs?: string[];
  /**
   * The name of the project we are extracting docs from
   */
  projectName: string;
  /**
   * The version string of the project we are extracting docs from
   */
  projectVersion: string;
}

export default class ExtracterTree extends Tree {

  options: ExtracterTreeOptions;

  constructor(sourceTree: Tree | string, options: ExtracterTreeOptions) {
    super([ sourceTree ]);
    this.options = options;
  }

  build() {
    let input = this.inputPaths[0];
    // If docs data was already extracted, just use that
    if (fs.existsSync(path.join(input, 'docs.json'))) {
      let docs = fs.readFileSync(path.join(input, 'docs.json'));
      fs.writeFileSync(path.join(this.outputPath, 'docs.json'), docs);
    } else {
      let extracter = new Extracter({
        dir: input,
        projectName: this.options.projectName,
        projectVersion: this.options.projectVersion,
        sourceDirs: this.options.sourceDirs,
        pagesDir: this.options.pagesDir
      });
      let docs = extracter.extract();
      fs.writeFileSync(path.join(this.outputPath, 'docs.json'), JSON.stringify(docs));
    }
  }

}
