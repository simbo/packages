import type { Opts } from 'minimist';

/**
 * Minimist Options for Clirk
 *
 * Clirk supports all minimist options except `boolean: true` which is IMHO
 * just unnecessary complexity without benefit.
 */
export interface MinimistOptions extends Opts {
  boolean?: string | string[];
}
