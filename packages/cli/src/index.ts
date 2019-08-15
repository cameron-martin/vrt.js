#!/usr/bin/env node

import { run } from '@vrt.js/core';
import yargs from 'yargs';
import _module from 'module';
import path from 'path';

process.on('unhandledRejection', error => {
  throw error;
});

const requireConfig = _module.createRequireFromPath(
  path.join(process.cwd(), 'dummy-module.js'),
);

const getConfig = (configPath: string) => {
  const config = requireConfig(configPath);

  return config.__esModule ? config.default : config;
};

(async () => {
  const argv = yargs
    .option('config', {
      type: 'string',
      alias: 'c',
      demandOption: true,
    })
    .option('require', {
      array: true,
      string: true,
      alias: 'r',
      default: [] as string[],
    })
    .help().argv;

  argv.require.forEach(file => {
    require(file);
  });

  await run(getConfig(argv.config));
})();
