import { log } from 'node:console';

import { terminated } from '@simbo/cli-output';
import { gracefulExit } from '@simbo/graceful-exit';

import type { ClirkContext } from '../types/clirk-context.interface.js';

export const DEFAULT_MINIMIST_OPTIONS = {
  string: [],
  boolean: [],
  alias: {},
  default: {},
};

export const DEFAULT_USAGE_LABEL = 'USAGE';
export const DEFAULT_PARAMETERS_LABEL = 'PARAMETERS';
export const DEFAULT_OPTIONS_LABEL = 'OPTIONS';

export const DEFAULT_SIGINT_MESSAGE = terminated('Received SIGINT');

export const DEFAULT_SIGINT_HANDLER = async (context: ClirkContext): Promise<void> => {
  log(context.sigintMessage);
  await gracefulExit(undefined, 1);
};
