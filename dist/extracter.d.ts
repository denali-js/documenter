/// <reference types="lodash" />
import { Dictionary } from 'lodash';
import API from './api';
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
    extracters: Dictionary<{
        default: ExtracterMethod;
    }>;
    constructor(options: ExtractorOptions);
    /**
     * Extract docs from the directory
     */
    extract(): ExtractedDocs;
    extractPages(): Dictionary<string>;
    extractApi(): API;
    detectSourceType(): string | null;
    private defaultOptions(dir);
}
