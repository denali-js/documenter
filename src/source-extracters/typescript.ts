import * as path from 'path';
import { Application, ProjectReflection } from 'typedoc';
import API, { Class, Method, Property, Tag, MethodSignature, Interface } from '../api';
import ui from '../ui';
import * as createDebug from 'debug';
import { DeclarationReflection, SignatureReflection, Comment } from "typedoc/dist/lib/models";
import { sync as glob } from 'glob';
import SourceExtracter from "./base";

const debug = createDebug('documenter:extracter:typescript');

export default class TypescriptSourceExtracter extends SourceExtracter {

  extract(): API {
    debug(`Extracting API from Typescript source`);
    let typedocOutput = this.runTypedoc();
    this.normalize(typedocOutput);
    return this.result;
  }

  sourcePatterns() {
    return this.sourceDirs.reduce((files, dir) => {
      let pattern = path.join(dir, '**', '*.ts');
      return files.concat(glob(pattern, { cwd: this.baseDir }));
    }, <string[]>[]);
  }

  runTypedoc() {
    debug(`Running Typedoc to extract inline documentation from:\n  ${ this.sourceDirs.join('\n  ') }`);
    let files = this.sourcePatterns();
    let originalDir = process.cwd();
    process.chdir(this.baseDir);
    let app = new Application({ ignoreCompilerErrors: true });
    let result = app.convert(files);
    process.chdir(originalDir);
    return result;
  }

  normalize(project: ProjectReflection) {
    debug(`Transforming Typedoc output into Documenter standard format`);
    (project.children || []).forEach((file) => {
      (file.children|| []).forEach((item) => {
        if (item.flags.isExported) {
          let packageName = this.getPackageName(item);
          let pkg = this.getPackage(packageName);

          // Free functions
          if (item.kindString === 'Function') {
            debug(`normalizing ${ item.name } as function`);
            pkg.functions.push(this.normalizeFunction(item));

          // Interfaces
          } else if (item.kindString === 'Interface') {
            debug(`normalizing ${ item.name } as interface`);
            pkg.interfaces[item.name] = this.normalizeInterface(item);

          // Classes
          } else if (item.kindString === 'Class') {
            debug(`normalizing ${ item.name } as class`);
            pkg.classes[item.name] = this.normalizeClass(item);

          } else {
            let filename = item.sources[0].fileName;
            // Chop of broccoli tmp directories if present
            if (filename.startsWith('tmp')) {
              filename = filename.split('/').slice(2).join('/');
            }
            ui.warn(`${ filename } exported a ${ item.kindString }, and I don't know how to document that`);
          }

        }
      });
    });
  }

  normalizeFunction(item: DeclarationReflection): Method {
    return Object.assign(this.normalizeCommon(item), {
      description: this.getCommentText(item.signatures[0].comment),
      signatures: this.normalizeSignatures(item.signatures)
    });
  }

  normalizeMethod(item: DeclarationReflection): Method {
    return Object.assign(this.normalizeFunction(item), {
      inherited: Boolean(item.inheritedFrom)
    });
  }

  normalizeInterface(item: DeclarationReflection): Interface {
    return Object.assign(this.normalizeCommon(item), {
      properties: this.normalizeProperties(item.children, false),
      methods: this.normalizeMethods(item.children, false)
    });
  }

  normalizeClass(item: DeclarationReflection): Class {
    return Object.assign(this.normalizeCommon(item), {
      staticProperties: this.normalizeProperties(item.children, true),
      staticMethods: this.normalizeMethods(item.children, true),
      properties: this.normalizeProperties(item.children, false),
      methods: this.normalizeMethods(item.children, false)
    });
  }

  normalizeProperties(children: DeclarationReflection[], isStatic: boolean) {
    if (!children) {
      return {};
    }
    return children.reduce((properties, child) => {
      if (child.flags.isStatic === isStatic) {
        if (child.kindString === 'Property') {
          properties[child.name] = this.normalizeProperty(child);
        } else if (child.kindString === 'Accessor' && child.getSignature) {
          properties[child.name] = this.normalizeAccessor(child);
        }
      }
      return properties;
    }, <{ [propertyName: string]: Property }>{});
  }

  normalizeProperty(item: DeclarationReflection): Property {
    return Object.assign(this.normalizeCommon(item), {
      type: this.displayTypeFrom(item.type),
      inherited: Boolean(item.inheritedFrom)
    });
  }

  normalizeAccessor(item: DeclarationReflection): Property {
    return Object.assign(this.normalizeCommon(item), {
      type: this.displayTypeFrom(item.getSignature.type),
      inherited: Boolean(item.inheritedFrom)
    });
  }

  normalizeMethods(children: DeclarationReflection[], isStatic: boolean) {
    if (!children) {
      return {};
    }
    return children.reduce((methods, child) => {
      if (child.flags.isStatic === isStatic && child.kindString === 'Method') {
        methods[child.name] = this.normalizeMethod(child);
      }
      return methods;
    }, <{ [methodName: string]: Method }>{});
  }

  normalizeSignatures(signatures: SignatureReflection[]): MethodSignature[] {
    return signatures.map((signature) => {
      return {
        parameters: (signature.parameters || []).map((param) => {
          return {
            type: this.displayTypeFrom(param.type),
            name: param.name,
            description: this.getCommentText(param.comment)
          }
        }),
        return: {
          type: this.displayTypeFrom(signature.type),
          description: signature.comment && signature.comment.returns && signature.comment.returns.trim()
        }
      };
    })
  }

  normalizeCommon(item: DeclarationReflection) {
    let source = item.sources[0];
    let file = typeof source.file === 'undefined' ? source.fileName : source.file.fullFileName;
    return {
      name: item.name,
      description: this.getCommentText(item.comment),
      access: this.getAccess(item),
      deprecated: this.isDeprecated(item),
      file: this.relativeSourceFilepath(file),
      line: source.line,
      tags: this.getTags(item)
    };
  }

  getCommentText(comment: Comment | undefined): string | undefined {
    if (typeof comment !== 'undefined') {
      return [
        comment.shortText && comment.shortText.trim(),
        comment.text && comment.text.trim()
      ].filter((str) => str && str.length > 0).join('\n\n');
    }
  }

  getAccess(item: DeclarationReflection): string {
    if (item.flags.isProtected) {
      return 'protected';
    } else if (item.flags.isPrivate) {
      return 'private';
    } else {
      return 'public';
    }
  }

  getPackageName(item: DeclarationReflection): string | null {
    let tags = this.getTags(item);
    let pkgTag = tags.find((t) => t.name === 'package');
    if (pkgTag) {
      return <string>pkgTag.value;
    }
    return null;
  }

  getTags(item: DeclarationReflection): Tag[] {
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

  isDeprecated(item: DeclarationReflection): string | boolean {
    let tags = this.getTags(item);
    let deprecationTag = tags.find((t) => t.name === 'deprecated');
    return deprecationTag && deprecationTag.value || false;
  }

  displayTypeFrom(type: any): string {
    // Recurse into array types to render the actual type that makes up the array
    if (type.elementType) {
      return this.displayTypeFrom(type.elementType) + '[]';
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
      displayType += '<' + type.typeArguments.map(this.displayTypeFrom.bind(this)).join(', ') + '>';
    }

    return displayType;
  }

}
