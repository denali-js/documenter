declare module 'walk-sync';
declare module 'require-dir';
declare module 'yuidocjs';
declare module 'read-pkg';
declare module 'broccoli-plugin' {
  export = Tree;
  class Tree {
    inputPaths: string[];
    outputPath: string;
    cachePath: string[];
    constructor(inputNodes: (string | Tree)[], options?: {
      name: string,
      annotation: string,
      persistentOutput: boolean,
      needsCache: boolean
    });
    build(): void | Promise<void>;
  }
}