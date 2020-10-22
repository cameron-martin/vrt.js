import { run } from '@vrt.js/core';
import { runStaticServer } from './server';
import vrtConfig from './vrt-config';
import path from 'path';

export async function runExample() {
  const server = await runStaticServer(1234, path.resolve(__dirname, 'site'));

  try {
    await run(vrtConfig);
  } finally {
    server.close();
  }
}
