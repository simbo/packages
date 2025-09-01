#!/usr/bin/env node
import { clitch } from '@simbo/clirk/clitch';

import { monorepoPackagesListCli } from './monorepo-packages-list-cli.js';

await clitch(monorepoPackagesListCli);
