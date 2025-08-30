import { plural } from '@simbo/plural';
import { bold, cyan, dim, underline, yellow } from 'yoctocolors';

import type { ClirkContextWithoutMessages } from '../types/clirk-context.interface.js';

/**
 * Generates a help message for the CLI based on the provided context.
 *
 * @param context - The context containing CLI information such as title, name,
 * description, examples, usage, parameters, and options.
 * @returns A formatted string containing the help message.
 */
export function generateHelpMessage(context: ClirkContextWithoutMessages): string {
  const output: string[] = [
    ...getHeader(context),
    ...getUsage(context),
    ...getParameters(context),
    ...getOptions(context),
  ];
  return `\n${output.join('\n\n')}\n`;
}

/**
 * Generates the header for the CLI help message as an array of sections that
 * will later be joined with blank lines.
 *
 * @param context - The context containing CLI information such as package name and version.
 * @returns An array of strings representing the header section.
 */
function getHeader(context: ClirkContextWithoutMessages): string[] {
  const {
    icon,
    title,
    name,
    description,
    package: {
      packageJson: { name: packageName, version, homepage },
    },
  } = context;

  return [
    `${icon ? `${icon} ` : ''}${bold(cyan(`${name} — ${title}`))}`,
    `${packageName} v${version}${homepage ? `\n${dim(underline(homepage))}` : ''}`,
    description.join('\n'),
  ];
}

/**
 * Generates the usage section of the CLI help message as an array of sections
 * that will later be joined with blank lines.
 *
 * @param context - The context containing CLI information such as examples and usage.
 * @returns An array of strings representing the usage section.
 */
function getUsage(context: ClirkContextWithoutMessages): string[] {
  const { examples, usage, usageLabel } = context;

  return [
    bold(`${usageLabel}:`),
    `  ${examples.map(example => yellow(example)).join('\n  ')}`,
    ...(usage.length > 0 ? [`  ${usage.join('\n  ')}`] : []),
  ];
}

/**
 * Generates the parameters section of the CLI help message as an array of sections
 * that will later be joined with blank lines.
 *
 * @param context - The context containing CLI information such as parameters and their descriptions.
 * @returns An array of strings representing the parameters section.
 */
function getParameters(context: ClirkContextWithoutMessages): string[] {
  const { parameters, parametersLabel } = context;

  if (parameters.size === 0) {
    return [];
  }

  const output: string[] = [bold(`${parametersLabel}:`)];

  for (const [key, { description }] of parameters.entries()) {
    output.push(`  ${yellow(key)}\n    ${description.join('\n    ')}`);
  }

  return output;
}

/**
 * Generates the options section of the CLI help message as an array of sections
 * that will later be joined with blank lines.
 *
 * @param context - The context containing CLI information such as options and their descriptions.
 * @returns An array of strings representing the options section.
 */
function getOptions(context: ClirkContextWithoutMessages): string[] {
  const { options, optionsLabel } = context;

  if (options.size === 0) {
    return [];
  }

  const output: string[] = [bold(`${optionsLabel}:`)];

  for (const [key, { description, aliases, type }] of options.entries()) {
    const value = type === 'string' ? dim('=<VALUE>') : '';
    let aliasDescription = `  ${yellow(`--${key}`)}${value}\n    ${description.join('\n    ')}`;
    if (aliases.size > 0) {
      const aliasList = [...aliases].map(alias => (alias.length === 1 ? `-${alias}` : `--${alias}`)).join(', ');
      aliasDescription += `\n    ${dim(`${plural(aliases.size, 'Alias', 'Aliases', '%s')}: ${aliasList}`)}`;
    }
    output.push(aliasDescription);
  }

  return output;
}
