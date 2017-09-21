import * as path from 'path';
import { existsSync as exists, readFileSync as read } from 'fs';
import { defaults, Dictionary } from 'lodash';
import * as walk from 'walk-sync';
import * as requireDir from 'require-dir';
import { sync as glob } from 'glob';
import API from './api';
import * as createDebug from 'debug';

const debug = createDebug('documenter:documenter');
const extractersDir = path.join(__dirname, 'extracters');

export interface ExtractorOptions {
  /**
   * The name of the project we are extracting docs from
   */
  projectName: string;
  /**
   * The version string of the project we are extracting docs from
   */
  projectVersion: string;
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

export interface ExtractedDocs {
  pages: Dictionary<string>;
  api: API;
}

export interface ExtracterMethod {
  (rootDir: string, sourceDirs: string[], dir: string): API;
}

export default class Extracter {

  /**
   * The name of the project we are extracting docs from
   */
  projectName: string;

  /**
   * The version string of the project we are extracting docs from
   */
  projectVersion: string;

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

  extracters = <Dictionary<{ default: ExtracterMethod }>>requireDir(extractersDir);

  constructor(options: ExtractorOptions) {
    defaults(options, this.defaultOptions(options.dir));
    debug(`Configuring for ${ options.dir }`);
    Object.assign(this, options);
  }

  /**
   * Extract docs from the directory
   */
  extract(): ExtractedDocs {
    debug(`Extracting docs for ${ this.dir }`);
    return {
      pages: this.extractPages(),
      api: this.extractApi()
    };
  }

  extractPages(): Dictionary<string> {
    let dir = path.join(this.dir, this.pagesDir);
    debug(`Extracting pages for ${ this.dir } from ${ dir }`);
    let files = walk(dir, { directories: false });
    return files.reduce((pages: Dictionary<string>, file: string) => {
      debug(`Found a page: ${ file }`);
      pages[file] = read(path.join(dir, file), 'utf-8');
      return pages;
    }, <Dictionary<string>>{});
  }

  extractApi(): API {
    debug(`Extracting API for ${ this.dir }`);
    let sourceType = this.detectSourceType();
    debug(`Source type for this project seems to be ${ sourceType }`);
    if (!sourceType) {
      throw new Error('Cannot extract API docs from this directory: unknown source type. Source must be Typescript or JavaScript');
    }
    return this.extracters[sourceType].default.call(null, this);
  }

  detectSourceType(): string | null {
    // Typescript
    if (exists(path.join(this.dir, 'tsconfig.json'))) {
      return 'typescript';
    // JavaScript
    } else if (glob(path.join(this.dir, `{${ this.sourceDirs.join(',') }}`, '**', '*.js'))) {
      return 'javascript';
    }
    return null;
  }

  private defaultOptions(dir: string) {
    return {
      dir,
      pagesDir: path.join(dir, 'docs'),
      sourceDir: [ path.join(dir, 'src') ]
    };
  }

}