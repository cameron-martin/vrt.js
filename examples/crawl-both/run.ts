import { run } from '@vrt.js/core';
import express from 'express';
import path from 'path';
import vrtConfig from './vrt-config';

function runServer() {
  const app = express();
  const port = 1234;

  app.use(express.static(path.resolve(__dirname, 'site')));

  return app.listen(port);
}

export async function runExample() {
  const server = runServer();

  try {
    await run(vrtConfig);
  } finally {
    server.close();
  }
}

runExample();
