/**
 * A GitHub repository, split into owner and name.
 */
export interface Repository {
  /**
   * The user or organization that owns the repository.
   */
  owner: string;

  /**
   * The name of the repository.
   */
  repo: string;
}

/**
 * The main function of a GitHub Action.
 */
export type ActionMain = () => Promise<void> | void;
