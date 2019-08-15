import * as t from 'runtypes';
import path from 'path';

export const Manifest = t.Array(
  t.Record({
    image: t.String,
    key: t.Dictionary(t.String),
  }),
);

export type Manifest = t.Static<typeof Manifest>;

export const getManifestPath = (directory: string) =>
  path.join(directory, 'manifest.json');
