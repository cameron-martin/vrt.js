import express from 'express';
import * as http from 'http';

export async function runStaticServer(port: number, dir: string) {
  const app = express();

  app.use(express.static(dir));

  return new Promise<http.Server>(resolve => {
    const server = app.listen(port);
    server.once('listening', () => {
      resolve(server);
    });
  });
}
