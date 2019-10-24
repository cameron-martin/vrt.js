import * as t from 'runtypes';
import path from 'path';

export const Manifest = t.Array(
  t.Record({
    image: t.String,
    properties: t.Record({
      key: t.String,
      browser: t.String,
      viewportWidth: t.Number,
    }),
  }),
);

export type Manifest = t.Static<typeof Manifest>;

export const getManifestPath = (directory: string) =>
  path.join(directory, 'manifest.json');
