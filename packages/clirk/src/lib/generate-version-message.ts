import type { ClirkContextWithoutMessages } from '../types/clirk-context.interface.js';

/**
 * Generates a version message for the CLI package.
 *
 * @param context - The context containing package information.
 * @returns A string message containing the package name and version.
 */
export function generateVersionMessage(context: ClirkContextWithoutMessages): string {
  const {
    package: {
      packageJson: { name, version },
    },
  } = context;

  return `${name} v${version}`;
}
