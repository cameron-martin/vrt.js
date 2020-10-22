import { promises as fs } from 'fs';
import memoize from 'lodash/memoize';
import { Backend, Screenshot } from '@vrt.js/core';
import path from 'path';
import { Manifest, getManifestPath } from './Manifest';

/**
 * Uses screenshots stored on the filesystem as one side of the comparison
 */
export default class FilesystemBackend implements Backend {
  private readonly manifestPath: string;
  constructor(directory: string) {
    this.manifestPath = getManifestPath(directory);
  }

  private getManifest = memoize(async () => {
    try {
      const contents = JSON.parse(await fs.readFile(this.manifestPath, 'utf8'));

      return Manifest.check(contents);
    } catch (e) {
      if (e.code === 'ENOENT') {
        return null;
      } else {
        throw e;
      }
    }
  });

  async *getScreenshots(): AsyncIterableIterator<Screenshot> {
    const manifest = await this.getManifest();

    if (manifest == null) {
      return;
    }

    for (const entry of manifest) {
      const image = await fs.readFile(
        path.resolve(this.manifestPath, entry.image),
      );

      yield {
        image,
        properties: entry.properties,
      };
    }
  }
}
