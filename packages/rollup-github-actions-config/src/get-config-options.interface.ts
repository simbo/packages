/**
 * Options for the Rollup GitHub Actions configuration.
 */
export interface RollupGithubActionsConfigOptions {
  tsconfig: string;
  minify: boolean;
  knownWarnings: Record<string, string[]>;
}
