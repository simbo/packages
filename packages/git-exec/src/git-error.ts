/**
 * Details of a failed Git command.
 */
export interface GitErrorDetails {
  /**
   * The Git arguments.
   */
  args: readonly string[];

  /**
   * The exit code, or `undefined` if Git did not exit on its own, for example
   * because it could not be started or was terminated by a signal.
   */
  exitCode: number | undefined;

  /**
   * The trimmed standard error output.
   */
  stderr: string;

  /**
   * The original error.
   */
  cause: unknown;
}

/**
 * An error thrown when a Git command fails.
 */
export class GitError extends Error {
  /**
   * The Git arguments.
   */
  public readonly args: readonly string[];

  /**
   * The exit code, or `undefined` if Git did not exit on its own.
   */
  public readonly exitCode: number | undefined;

  /**
   * The trimmed standard error output.
   */
  public readonly stderr: string;

  /**
   * Creates an error for a failed Git command.
   *
   * @param message - The error message.
   * @param details - The details of the failed command.
   */
  public constructor(message: string, details: GitErrorDetails) {
    super(message, { cause: details.cause });
    this.name = 'GitError';
    this.args = details.args;
    this.exitCode = details.exitCode;
    this.stderr = details.stderr;
  }
}
