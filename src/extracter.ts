import path from 'path';
import { existsSync as exists, readFileSync as read } from 'fs';
import { defaults, Dictionary } from 'lodash';
import walk from 'walk-sync';
import { sync as glob } from 'glob';
import frontmatter from 'front-matter';
import API from './api';
import TypescriptSourceExtracter from './source-extracters/typescript';
import JavascriptSourceExtracter from './source-extracters/javascript';
import createDebug from 'debug';

const debug = createDebug('documenter:extracter');
const sourceExtracters = {
  'typescript': TypescriptSourceExtracter,
  'javascript': JavascriptSourceExtracter
};

export interface ExtracterOptions {
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
  name: string;
  version: string;
  pages: Dictionary<string>;
  api: API;
  documenter: {
    version: string;
  }
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
   * The absolute path to the directory containing all the Pages to build, relative to `dir`. Defaults to dir + `docs`
   */
  pagesDir: string;

  /**
   * An array of ab solute paths to the directories containing the source code to extract API docs from.
   * Defaults to dir + `src`
   */
  sourceDirs: string[];

  constructor(options: ExtracterOptions) {
    defaults(options, this.defaultOptions(options.dir));
    debug(`Configuring for ${ options.dir }`);
    this.dir = options.dir;
    this.pagesDir = options.pagesDir || 'docs';
    this.sourceDirs = options.sourceDirs || [ 'src' ];
    this.projectName = options.projectName;
    this.projectVersion = options.projectVersion;

    if (!path.isAbsolute(this.pagesDir)) {
      this.pagesDir = path.join(this.dir, this.pagesDir);
    }
    this.sourceDirs = this.sourceDirs.map((d) => {
      if (!path.isAbsolute(d)) {
        return path.join(this.dir, d);
      }
      return d;
    });
    if (!exists(this.dir)) {
      throw new Error(`${ this.dir } does not exist, cannot extract documention from it`);
    }
  }

  /**
   * Extract docs from the directory
   */
  extract(): ExtractedDocs {
    debug(`Extracting docs for ${ this.projectName }@${ this.projectVersion } from ${ this.dir }`);
    return {
      name: this.projectName,
      version: this.projectVersion,
      pages: this.extractPages(),
      api: this.extractApi(),
      documenter: {
        version: '1.0'
      }
    };
  }

  extractPages(): Dictionary<string> {
    let dir = this.pagesDir;
    debug(`Extracting pages for ${ this.dir } from ${ dir }`);
    if (exists(dir)) {
      let files = walk(dir, { directories: false });
      return files.reduce((pages: Dictionary<string>, file: string) => {
        debug(`Found a page: ${ file }`);
        let rawContents = read(path.join(dir, file), 'utf-8');
        let parsedContents = frontmatter(rawContents);
        let filenameWithoutExtensions = path.join(path.dirname(file), path.basename(file, path.extname(file)));
        pages[filenameWithoutExtensions] = Object.assign(parsedContents.attributes, {
          contents: parsedContents.body
        });
        return pages;
      }, <Dictionary<string>>{});
    }
    return {};
  }

  extractApi(): API {
    debug(`Extracting API for ${ this.dir }`);
    let sourceType = this.detectSourceType();
    if (!sourceType) {
      throw new Error('Cannot extract API docs from this directory: unknown source type. Source must be Typescript or JavaScript');
    }
    let sourceExtracter = new sourceExtracters[sourceType](this);
    return sourceExtracter.extract();
  }

  detectSourceType(): 'typescript' | 'javascript' | null {
    debug(`Checking source type for project located in ${ this.dir }`);
    let basePattern: string;
    if (this.sourceDirs.length > 1) {
      basePattern = `{${ this.sourceDirs.join(',') }}`;
    } else {
      basePattern = this.sourceDirs[0];
    }
    basePattern = path.join(basePattern, '**', '*');
    // Typescript
    if (glob(`${ basePattern }.ts`).length > 0) {
      debug(`Found .ts files in ${ this.dir }, assuming Typescript`);
      return 'typescript';
    // JavaScript
    } else if (glob(`${ basePattern }.js`).length > 0) {
      debug(`Found no .ts files ${ this.dir }, assuming JavaScript`);
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