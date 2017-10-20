declare module 'walk-sync';
declare module 'require-dir';
declare module 'yuidocjs';
declare module 'read-pkg';
declare module 'broccoli-plugin' {
  export = Plugin;
  class Plugin {
    inputPaths: string[];
    outputPath: string;
    cachePath: string[];
    constructor(inputNodes: (string | Plugin)[], options?: {
      name: string,
      annotation: string,
      persistentOutput: boolean,
      needsCache: boolean
    });
    build(): void | Promise<void>;
  }
}