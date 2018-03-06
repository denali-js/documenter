import path from 'path';
import Extracter from "../extracter";
import API, { Package }  from '../api';

export default abstract class SourceExtracter {

  sourceDirs: string[];
  baseDir: string;
  result: API = {
    packages: {}
  };

  constructor(public extracter: Extracter) {
    this.baseDir = extracter.dir;
    this.sourceDirs = extracter.sourceDirs;
  }

  abstract extract(): API;

  getPackage(packageName: string | null): Package {
    if (!packageName) {
      packageName = this.extracter.projectName;
    }
    if (!this.result.packages[packageName]) {
      this.result.packages[packageName] = {
        classes: {},
        interfaces: {},
        functions: []
      };
    }
    return this.result.packages[packageName];
  }

  relativeSourceFilepath(absolutepath: string): string {
    return path.relative(this.baseDir, absolutepath);
  }

}