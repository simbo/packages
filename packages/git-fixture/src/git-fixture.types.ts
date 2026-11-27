/**
 * Files to write, as paths relative to the repository root mapped to their
 * contents. Parent directories are created as needed.
 */
export type GitFixtureFiles = Readonly<Record<string, string | Uint8Array>>;

/**
 * Options for every fixture.
 */
export interface GitFixtureOptions {
  /**
   * The prefix of the temporary directory name.
   *
   * @default 'git-fixture-'
   */
  prefix?: string;

  /**
   * The author and committer date of all commits, as `Date` or in a format
   * that Git accepts, such as ISO 8601. A fixed date makes commit hashes
   * reproducible.
   *
   * @default '2000-01-01T00:00:00Z'
   */
  date?: Date | string;

  /**
   * A callback for debug messages. It receives every Git command of the
   * fixture before it runs.
   */
  debug?: (message: string) => void;
}

/**
 * Options for creating a new repository.
 */
export interface CreateGitFixtureOptions extends GitFixtureOptions {
  /**
   * The name of the initial branch.
   *
   * @default 'main'
   */
  initialBranch?: string;

  /**
   * Files of an initial commit. Without files, the repository has no commits.
   */
  files?: GitFixtureFiles;

  /**
   * The message of the initial commit.
   *
   * @default 'initial'
   */
  message?: string;
}

/**
 * Options for cloning a repository.
 */
export interface CloneGitFixtureOptions extends GitFixtureOptions {
  /**
   * Additional arguments for `git clone`, such as `['--branch', 'feature']`.
   * They are passed before the source.
   */
  args?: readonly string[];
}

/**
 * A temporary Git repository for tests.
 *
 * Remove it with `cleanup()`, or declare it with `await using` to remove it
 * at the end of the scope.
 */
export interface GitFixture extends AsyncDisposable {
  /**
   * The absolute path of the repository, with symbolic links resolved.
   */
  readonly dir: string;

  /**
   * The environment variables of the neutral configuration. Set them for the
   * code under test, so that it runs Git like the fixture.
   */
  readonly env: Readonly<Record<string, string>>;

  /**
   * Runs a Git command in the repository with the neutral configuration.
   *
   * @param args - The Git arguments.
   * @returns The trimmed standard output.
   * @throws {GitError} if the command fails.
   */
  git: (args: readonly string[]) => Promise<string>;

  /**
   * Runs a Git command in the repository with the neutral configuration and
   * reports whether it exited with code 0.
   *
   * @param args - The Git arguments.
   * @returns `true` if the command exited with code 0, otherwise `false`.
   * @throws {GitError} if Git cannot run.
   */
  gitSucceeds: (args: readonly string[]) => Promise<boolean>;

  /**
   * Resolves a path in the repository.
   *
   * @param segments - Path segments relative to the repository root.
   * @returns The absolute path.
   */
  path: (...segments: string[]) => string;

  /**
   * Writes a file in the repository without staging it, creating parent
   * directories as needed.
   *
   * @param path - The file path relative to the repository root.
   * @param contents - The file contents.
   * @throws {Error} if the path is outside the repository, also through symbolic links.
   */
  write: (path: string, contents: string | Uint8Array) => Promise<void>;

  /**
   * Writes several files in the repository without staging them.
   *
   * @param files - The files to write.
   * @throws {Error} if a path is outside the repository, also through symbolic links.
   */
  writeFiles: (files: GitFixtureFiles) => Promise<void>;

  /**
   * Writes the files, stages all changes, and commits them. Without changes,
   * the commit is empty.
   *
   * @param message - The commit message.
   * @param files - Files to write before committing.
   * @returns The hash of the new commit.
   * @throws {GitError} if the commit fails.
   */
  commit: (message: string, files?: GitFixtureFiles) => Promise<string>;

  /**
   * Removes the repository directory.
   */
  cleanup: () => Promise<void>;
}
