import * as path from 'path';
import { Application, ProjectReflection } from 'typedoc';
import API, { Class, Method, Property, Tag, MethodSignature, Interface } from '../api';
import ui from '../ui';
import * as createDebug from 'debug';
import { DeclarationReflection, SignatureReflection } from "typedoc/dist/lib/models";
import Extracter from '../extracter';
import { sync as glob } from 'glob';

const debug = createDebug('documenter:extracter:typescript');

export default function extractTypescript(extracter: Extracter): API {
  debug(`Extracting API from Typescript source`);
  let typedocOutput = runTypedoc(extracter.dir, extracter.sourceDirs);
  return normalize(typedocOutput, extracter);
}

function runTypedoc(rootDir: string, sourceDirs: string[]) {
  debug(`Running Typedoc to extract inline documentation from:\n  ${ sourceDirs.join('\n  ') }`);
  let files = sourceDirs.reduce((files, dir) => {
    let pattern = path.join(dir, '**', '*.ts');
    return files.concat(glob(pattern));
  }, <string[]>[]);
  let originalDir = process.cwd();
  process.chdir(rootDir);
  let app = new Application({ tsconfig: path.join(rootDir, 'tsconfig.json'), ignoreCompilerErrors: true }); 
  let result = app.convert(files);
  process.chdir(originalDir);
  return result;
}

function normalize(project: ProjectReflection, extracter: Extracter): API {
  debug(`Transforming Typedoc output into Documenter standard format`);
  let api: API = {
    packages: {}
  };
  project.children.forEach((file) => {
    (file.children|| []).forEach((item) => {
      if (item.flags.isExported) {
        let packageName = getPackageName(item);
        if (!packageName) {
          packageName = extracter.projectName;
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
        if (item.kindString === 'Function') {
          debug(`normalizing ${ item.name } as function`);
          pkg.functions.push(normalizeMethod(item));

        // Interfaces
        } else if (item.kindString === 'Interface') {
          debug(`normalizing ${ item.name } as interface`);
          pkg.interfaces[item.name] = normalizeInterface(item);

        // Classes
        } else if (item.kindString === 'Class') {
          debug(`normalizing ${ item.name } as class`);
          pkg.classes[item.name] = normalizeClass(item);

        } else {
          ui.warn(`${ item.sources[0].fileName } exported a ${ item.kindString }, and I don't know how to document that`);
        }

      }
    });
  });
  return api;
}

function normalizeMethod(item: DeclarationReflection): Method {
  let method = <Method>normalizeCommon(item);
  method.signatures = normalizeSignatures(item.signatures);
  return method;
}

function normalizeInterface(item: DeclarationReflection): Interface {
  return {
    name: item.name,
    description: item.comment && item.comment.text,
    properties: normalizeProperties(item.children, false),
    methods: normalizeMethods(item.children, false)
  };
}

function normalizeClass(item: DeclarationReflection): Class {
  return {
    name: item.name,
    description: item.comment && item.comment.text,
    staticProperties: normalizeProperties(item.children, true),
    staticMethods: normalizeMethods(item.children, true),
    properties: normalizeProperties(item.children, false),
    methods: normalizeMethods(item.children, false)
  };
}

function normalizeProperties(children: DeclarationReflection[], isStatic: boolean) {
  if (!children) {
    return {};
  }
  return children.reduce((properties, child) => {
    if (child.flags.isStatic === isStatic) {
      if (child.kindString === 'Property') {
        properties[child.name] = normalizeProperty(child);
      } else if (child.kindString === 'Accessor' && child.getSignature) {
        properties[child.name] = normalizeAccessor(child);
      }
    }
    return properties;
  }, <{ [propertyName: string]: Property }>{});
}

function normalizeProperty(item: DeclarationReflection): Property {
  let property = <Property>normalizeCommon(item);
  property.type = displayTypeFrom(item.type);
  return property;
}

function normalizeAccessor(item: DeclarationReflection): Property {
  let property = <Property>normalizeCommon(item);
  property.type = displayTypeFrom(item.getSignature.type);
  return property;
}

function normalizeMethods(children: DeclarationReflection[], isStatic: boolean) {
  if (!children) {
    return {};
  }
  return children.reduce((methods, child) => {
    if (child.flags.isStatic === isStatic && child.kindString === 'Method') {
      methods[child.name] = normalizeMethod(child);
    }
    return methods;
  }, <{ [methodName: string]: Method }>{});
}

function normalizeSignatures(signatures: SignatureReflection[]): MethodSignature[] {
  return signatures.map((signature) => {
    return {
      parameters: (signature.parameters || []).map((param) => {
        return {
          type: displayTypeFrom(param.type),
          name: param.name,
          description: param.comment && param.comment.text
        }
      }),
      return: {
        type: displayTypeFrom(signature.type),
        description: signature.comment && signature.comment.returns
      }
    };
  })
}

function normalizeCommon(item: DeclarationReflection) {
  return {
    name: item.name,
    description: item.comment && item.comment.text,
    access: getAccess(item),
    deprecated: isDeprecated(item),
    inherited: Boolean(item.inheritedFrom),
    file: item.sources[0].fileName,
    line: item.sources[0].line,
    tags: getTags(item)
  };
}

function getAccess(item: DeclarationReflection): string {
  if (item.flags.isProtected) {
    return 'protected';
  } else if (item.flags.isPrivate) {
    return 'private';
  } else {
    return 'public';
  }
}

function getPackageName(item: DeclarationReflection): string | undefined {
  let tags = getTags(item);
  let pkgTag = tags.find((t) => t.name === 'package');
  if (pkgTag) {
    return <string>pkgTag.value;
  }
}

function getTags(item: DeclarationReflection): Tag[] {
  if (item.comment && item.comment.tags) {
    return item.comment.tags.map((tag) => {
      return {
        name: tag.tagName,
        value: tag.text && tag.text.trim() || true
      };
    });
  }
  return [];
}

function isDeprecated(item: DeclarationReflection): string | boolean {
  let tags = getTags(item);
  let deprecationTag = tags.find((t) => t.name === 'deprecated');
  return deprecationTag && deprecationTag.value || false;
}

function displayTypeFrom(type: any): string {
  // Recurse into array types to render the actual type that makes up the array
  if (type.elementType) {
    return displayTypeFrom(type.elementType) + '[]';
  }

  // It's a literal, inline type definition, i.e. foo: { bar: boolean }
  if (type.declaration) {
    // TODO ideally we would actually render this type, but that's pretty complicated, so skipping for now
    return 'inline literal';
  }

  let displayType = type.name;

  // If it's a reference type (i.e. not a primitive like string), use the
  // actual definition name, not the name that is local to this file
  if (type.reflection) {
    displayType = type.reflection.name;
  }

  // Add any type args it might take, recursing into those types to render them properly
  if (type.typeArguments) {
    displayType += '<' + type.typeArguments.map(displayTypeFrom).join(', ') + '>';    
  }

  return displayType;
}

