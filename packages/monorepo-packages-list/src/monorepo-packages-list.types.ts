import type { WorkspaceMetadata } from '@simbo/monorepo-utils';

/**
 * Options for the monorepo packages list.
 */
export interface Options {
  /**
   * A template function to use for list items. Can optionally be async.
   * The function will receive the workspace metadata and template data as
   * arguments and should return the output string for each package entry.
   * Defaults to a simple markdown template function.
   */
  templateFn?: (workspaceMetadata: WorkspaceMetadata, templateData: TemplateData) => string | Promise<string>;

  /**
   * Data to use in the template function.
   */
  templateData?: TemplateData;

  /**
   * A function to compare two workspaces for sorting.
   * Receives the metadata for both workspaces and should return a negative
   * number if `a` should come before `b`, a positive number if `a` should come
   * after `b`, or 0 if they are equal.
   *
   * The default value is to sort by `workspace.relativePath` in natural
   * language order.
   */
  sortCompareFn?: SortCompareFn;

  /**
   * A function to filter the workspaces to include in the list.
   * Receives the workspace metadata and should return true to include it, or false to exclude it.
   * The default value is to include all workspaces.
   *
   * @default (workspace) => true
   */
  filterFn?: FilterFn;

  /**
   * The working directory to list packages from.
   * Should be the root of the monorepo.
   * Defaults to the current working directory.
   *
   * @default process.cwd()
   */
  workingDir?: string;

  /**
   * The delimiter to use between list items in the output.
   *
   * @default "\n\n"
   */
  delimiter?: string;

  /**
   * A string to add before the list.
   * Can be a static string or a function that receives all workspaces metadata and returns a string.
   * Defaults to a line of text mentioning the count of packages.
   */
  before?: string | BeforeAfterFn;

  /**
   * A string to add after the list.
   * Can be a static string or a function that receives all workspaces metadata and returns a string.
   *
   * @default ""
   */
  after?: string | BeforeAfterFn;
}

/**
 * Data to use in the template function.
 */
export interface TemplateData {
  /**
   * Allows additional template data to be passed to the template function.
   */
  [key: string]: unknown;

  /**
   * A function that receives the workspace metadata and returns the URL package in its the repository.
   * (e.g. https://github.com/user/repo/tree/main/packages/my-package/)
   */
  repoUrlFn?: TemplateDataFn;

  /**
   * A function that receives the workspace metadata and returns the URL to the package in the package registry.
   * (e.g. https://www.npmjs.com/package/@scope/my-package)
   */
  packageUrlFn?: TemplateDataFn;

  /**
   * A function that receives the workspace metadata and returns the URL to the package documentation.
   * (e.g. https://user.github.io/repo/modules/_scope_my-package)
   */
  docsUrlFn?: TemplateDataFn;

  /**
   * A function that receives the workspace metadata and returns the URL to the package README.
   * (e.g. https://github.com/user/repo/blob/main/packages/my-package/README.md)
   */
  readmeUrlFn?: TemplateDataFn;

  /**
   * A function that receives the workspace metadata and returns the URL to the package changelog.
   * (e.g. https://github.com/user/repo/blob/main/packages/my-package/CHANGELOG.md)
   */
  changelogUrlFn?: TemplateDataFn;
}

/**
 * A function that generates a string value to be used in the template.
 */
export type TemplateDataFn = (workspace: WorkspaceMetadata) => string | undefined | Promise<string | undefined>;

/**
 * A function to generate a string for a package list item.
 */
export type TemplateFn = (workspaceMetadata: WorkspaceMetadata, templateData: TemplateData) => string | Promise<string>;

/**
 * A function to sort an array of workspace metadata objects.
 */
export type SortCompareFn = (a: WorkspaceMetadata, b: WorkspaceMetadata) => number;

/**
 * A function to filter an array of workspace metadata objects.
 */
export type FilterFn = (workspace: WorkspaceMetadata) => boolean;

/**
 * A function to generate a string to insert before/after the list of packages.
 */
export type BeforeAfterFn = (workspaces: WorkspaceMetadata[]) => string | Promise<string>;
