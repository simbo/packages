import { readFileSync } from 'node:fs';

// eslint-disable-next-line n/no-sync -- A documented exception stays allowed.
export const allowed = readFileSync('allowed.txt', 'utf8');
export const reported = readFileSync('reported.txt', 'utf8');
