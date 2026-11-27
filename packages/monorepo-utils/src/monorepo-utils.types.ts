import type { PackageJson, SetRequired } from 'type-fest';

/**
 * Metadata for a workspace.
 */
export interface WorkspaceMetadata {
  /**
   * The name from the workspace's package.json file.
   */
  name: string;

  /**
   * The version from the workspace's package.json file.
   */
  version: string;

  /**
   * The description from the workspace's package.json file.
   */
  description: string;

  /**
   * The private status from the workspace's package.json file.
   */
  private: boolean;

  /**
   * The relative path to the workspace from the root of the repository.
   */
  relativePath: string;

  /**
   * The absolute path to the workspace.
   */
  absolutePath: string;

  /**
   * The folder name of the workspace.
   */
  folderName: string;

  /**
   * The validated package.json for the workspace.
   */
  packageJson: ValidatedPackageJson;

  /**
   * The content of the workspace's README.md file.
   */
  readme: string;

  /**
   * The H1 title of the workspace's README.md file as plain text, without images, HTML tags, links, and formatting.
   */
  title: string;
}

/**
 * A validated package.json file that includes name, version, and description.
 */
export type ValidatedPackageJson = SetRequired<PackageJson, 'name' | 'version' | 'description'>;
