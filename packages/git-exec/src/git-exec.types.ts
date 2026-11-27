/**
 * Options for running a Git command.
 */
export interface GitOptions {
  /**
   * The working directory of the Git command.
   *
   * @default process.cwd()
   */
  cwd?: string;

  /**
   * Environment variables for the Git command, merged over `process.env`.
   * A variable set to `undefined` is removed from the environment.
   */
  env?: Record<string, string | undefined>;

  /**
   * The largest amount of data in bytes allowed on standard output or
   * standard error. The command fails if it is exceeded.
   *
   * @default 1073741824 (1 GiB)
   */
  maxBuffer?: number;

  /**
   * A callback for debug messages, such as `core.debug` in GitHub Actions.
   * It receives the command before it runs, and the reason when
   * `gitSucceeds()` reports a failure.
   */
  debug?: (message: string) => void;
}
