import * as Y from 'yuidocjs';
import { dirSync as tmp } from 'tmp';
import API, { FreeFunction, Package, Class, Method, Property } from '../api';
import ui from '../ui';
import * as createDebug from 'debug';
import Extracter from '../extracter';

process.removeAllListeners('uncaughtException');

const debug = createDebug('documenter:extracter:javascript');

export default function extractJavaScript(extracter: Extracter): API {
  debug(`Extracting API from JavaScript source`);
  let yuidocOutput = runYuidoc(extracter.sourceDirs);
  return normalize(yuidocOutput, extracter);
}

function runYuidoc(sourceDirs: string[]): Yuidoc {
  debug(`Running Yuidoc to extract inline documentation`);
  let outDir = tmp({ prefix: 'yuidoc-output-', unsafeCleanup: true }).name;
  let config = {
    options: {
      project : {
        options: {
          paths: sourceDirs,
          outdir: outDir,
          parseOnly: true
        }
      }
    }
  };
  let yuidoc = new Y.YUIDoc(config);
  return yuidoc.run();
}

function normalize(yuidoc: Yuidoc, extracter: Extracter): API {
  debug(`Transforming Yuidoc output into Documenter standard format`);
  let api: API = {
    name: extracter.projectName,
    version: extracter.projectVersion,
    packages: {}
  };
  yuidoc.classitems.forEach((item) => {
    let packageName = item.module;
    if (!packageName) {
      packageName = api.name
    }
    if (!api.packages[packageName]) {
      api.packages[packageName] = {
        classes: {},
        interfaces: {},
        functions: []
      };
    }
    let pkg = api.packages[packageName];

    // Free functions
    if (!item.class && item.itemtype === 'method') {
      debug(`Normalizing free function: ${ item.name }`);
      pkg.functions.push(normalizeFunction(item));

    // Class members
    } else {
      normalizeClassItem(pkg, item);
    }

  });
  return api;
}

function normalizeFunction(item: ClassItem): FreeFunction {
  return {
    name: item.name,
    description: item.description,
    access: item.access,
    package: item.module,
    tags: [],
    deprecated: item.deprecated,
    file: item.file,
    line: item.line,
    signatures: [
      {
        return: {
          type: (item.return || {}).type,
          description: (item.return || {}).description
        },
        parameters: item.params || []
      }
    ]
  };
}

function normalizeClassItem(pkg: Package, item: ClassItem) {
  debug(`Normalizing class item: ${ item.name }`);
  let klass = getOrAddClass(pkg, item.class);

  if (item.is_constructor) {
    populateClass(klass, item);
  } else if (item.class) {
    addClassMember(klass, item);
  } else {
    ui.warn(`Invalid classitem found: ${ item.name } is not a constructor, free function, or class member. I don't know how to document that`);
  }
}

function getOrAddClass(pkg: Package, className: string) {
  if (!pkg.classes[className]) {
    pkg.classes[className] = {
      name: className,
      staticProperties: {},
      staticMethods: {},
      properties: {},
      methods: {}
    };
  }
  return pkg.classes[className];
}

function populateClass(klass: Class, item: ClassItem) {
  klass.name = item.name;
  klass.description = item.description;
}

function addClassMember(klass: Class, item: ClassItem) {
  if (item.itemtype === 'method') {
    addClassMethod(klass, item);
  } else if (item.itemtype === 'property') {
    addClassProperty(klass, item);
  } else {
    ui.warn(`Unrecognized itemtype: ${ item.itemtype }. I don't know how to document that.`);
  }
}

function addClassMethod(klass: Class, item: ClassItem) {
  let method: Method = {
    name: item.name,
    description: item.description,
    access: item.access,
    deprecated: item.deprecated,
    inherited: null,
    file: item.file,
    line: item.line,
    tags: [],
    signatures: [
      {
        parameters: item.params || [],
        return: item.return || {}
      }
    ]
  };
  if (item.static) {
    klass.staticMethods[item.name] = method;
  } else {
    klass.methods[item.name] = method;
  }
}

function addClassProperty(klass: Class, item: ClassItem) {
  let property: Property = {
    name: item.name,
    description: item.description,
    type: item.type,
    access: item.access,
    deprecated: item.deprecated,
    inherited: null,
    file: item.file,
    line: item.line,
    tags: [],
  };
  if (item.static) {
    klass.staticProperties[item.name] = property;
  } else {
    klass.properties[item.name] = property;
  }
}

interface Yuidoc {
  project: {
    name: string;
  };
  classitems: ClassItem[];
}

interface Param {
  name: string;
  description?: string;
  type?: string;
}

interface ClassItem {
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