import * as Y from 'yuidocjs';
import { forEach } from 'lodash';
import { dirSync as tmp } from 'tmp';
import { inspect } from 'util';
import API, { FreeFunction, Package, Class, Method, Property } from '../api';
import ui from '../ui';
import * as createDebug from 'debug';
import SourceExtracter from "./base";

process.removeAllListeners('uncaughtException');

const debug = createDebug('documenter:extracter:javascript');

export default class JavascriptSourceExtracter extends SourceExtracter {

  extract(): API {
    debug(`Extracting API from JavaScript source`);
    let yuidocOutput = this.runYuidoc();
    this.normalize(yuidocOutput);
    return this.result;
  }

  runYuidoc(): YUIDoc.Project {
    debug(`Running Yuidoc to extract inline documentation`);
    let outDir = tmp({ prefix: 'yuidoc-output-', unsafeCleanup: true }).name;
    let config = {
      quiet: true,
      outdir: outDir,
      paths: this.sourceDirs,
      parseOnly: true
    };
    let yuidoc = new Y.YUIDoc(config);
    return yuidoc.run();
  }

  normalize(yuidoc: YUIDoc.Project) {
    debug(`Transforming Yuidoc output into Documenter standard format`);
    // Seed classes
    forEach(yuidoc.classes, (klass, name) => {
      let packageName = this.getPackageName(klass);
      let pkg = this.getPackage(packageName);
      pkg.classes[name] = this.normalizeClass(pkg, klass);
    });

    yuidoc.classitems
    .filter((item) => item.class === '' && item.itemtype === 'method')
    .forEach((item) => {
      let packageName = this.getPackageName(item);
      let pkg = this.getPackage(packageName);
      pkg.functions.push(this.normalizeFunction(item));
    });

    yuidoc.classitems
    .filter((item) => !(item.class === '' && item.itemtype === 'method'))
    .forEach((item) => {
      let packageName = this.getPackageName(item);
      let pkg = this.getPackage(packageName);
      let klass = pkg.classes[item.class];
      if (!klass) {
        ui.warn(`The ${ item.name } ${ item.itemtype } is documented to belong to the ${ item.class } class, but that class has no documented constructor. Discarding ...`);
        return;
      }
      this.normalizeClassItem(klass, item);
    });

    yuidoc.classitems
    .filter((item) => item.class === '' && item.itemtype !== 'method')
    .forEach((item) => {
      ui.warn(`Unknown class item found: ${ inspect(item) } is not a constructor, free function, or class member. I don't know how to document that`);
    });
  }

  getPackageName(item: { module?: string }): string | null {
    return item.module ? item.module : null;
  }

  normalizeCommon(item: {
    name: string,
    description: string,
    access?: string,
    deprecated?: true,
    line: number,
    file: string
  }) {
    return {
      name: item.name,
      description: item.description && item.description.trim(),
      access: item.access || 'public',
      deprecated: item.deprecated || false,
      line: item.line,
      file: this.relativeSourceFilepath(item.file),
      tags: []
    }
  }

  normalizeClass(pkg: Package, klass: YUIDoc.Class): Class {
    return Object.assign(this.normalizeCommon(klass), {
      properties: {},
      methods: {},
      staticProperties: {},
      staticMethods: {}
    });
  }

  normalizeFunction(item: YUIDoc.ClassItem): FreeFunction {
    debug(`Normalizing free function: ${ item.name }`);
    return Object.assign(this.normalizeCommon(item), {
      signatures: [
        {
          parameters: this.normalizeParams(item.params),
          return: {
            type: item.return && item.return.type && item.return.type.toLowerCase(),
            description: item.return && item.return.description && item.return.description.trim()
          }
        }
      ]
    });
  }

  normalizeParams(params: YUIDoc.Param[] | undefined) {
    if (typeof params === 'undefined') {
      return [];
    }
    return params.map((p) => {
      return {
        description: p.description && p.description.trim(),
        name: p.name,
        type: p.type && p.type.toLowerCase()
      }
    })
  }

  normalizeClassItem(klass: Class, item: YUIDoc.ClassItem) {
    debug(`Normalizing class item: ${ item.name }`);
    if (item.itemtype === 'method') {
      this.addClassMethod(klass, item);
    } else if (item.itemtype === 'property') {
      this.addClassProperty(klass, item);
    } else {
      ui.warn(`Unrecognized class item type: ${ item.itemtype }. I don't know how to document that.`);
    }
  }

  addClassMethod(klass: Class, item: YUIDoc.ClassItem) {
    let method: Method = Object.assign(this.normalizeCommon(item), {
      inherited: undefined,
      signatures: [
        {
          parameters: this.normalizeParams(item.params),
          return: {
            type: item.return && item.return.type && item.return.type.toLowerCase(),
            description: item.return && item.return.description && item.return.description.trim()
          }
        }
      ]
    });
    if (item.static) {
      klass.staticMethods[item.name] = method;
    } else {
      klass.methods[item.name] = method;
    }
  }

  addClassProperty(klass: Class, item: YUIDoc.ClassItem) {
    let property: Property = Object.assign(this.normalizeCommon(item), {
      inherited: undefined,
      type: item.type && item.type.toLowerCase()
    });
    if (item.static) {
      klass.staticProperties[item.name] = property;
    } else {
      klass.properties[item.name] = property;
    }
  }

}

export namespace YUIDoc {

  export interface Project {
    project: {
      name: string;
    };
    classes: {
      [name: string]: Class;
    };
    classitems: ClassItem[];
  }

  export interface Class {
    name: string;
    description: string;
    line: number;
    file: string;
    access?: string;
    module?: string;
  }

  export interface Param {
    name: string;
    description?: string;
    type?: string;
  }

  export interface ClassItem {
    file: string;
    line: number;
    description: string;
    class: string;
    module?: string;
    itemtype?: 'main' | 'method' | 'property';
    name: string;
    access?: string;
    params?: Param[];
    async?: 1;
    type?: string;
    deprecated?: true;
    is_constructor?: 1;
    static?: 1;
    throws?: {
      type?: string;
      description?: string;
    };
    return?: {
      description?: string;
      type?: string;
    }
  }

}