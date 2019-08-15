import run from '../core/run';
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
    .help().argv;

  await run(getConfig(argv.config));
})();
