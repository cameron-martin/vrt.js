import { promises as fs } from 'fs';
import memoize from 'lodash/memoize';
import { Backend, Screenshot } from '@vrt.js/core';
import path from 'path';
import { Manifest } from './Manifest';

/**
 * Uses screenshots stored on the filesystem as one side of the comparison
 */
export default class FilesystemBackend implements Backend {
  private readonly manifestPath: string;
  constructor(directory: string) {
    this.manifestPath = path.join(directory, 'manifest.json');
  }

  private getManifest: () => Promise<Manifest> = memoize(async () => {
    const contents = JSON.parse(await fs.readFile(this.manifestPath, 'utf8'));

    return Manifest.check(contents);
  });

  async *getScreenshots(): AsyncIterableIterator<Screenshot> {
    const manifest = await this.getManifest();

    for (const entry of manifest) {
      const image = await fs.readFile(
        path.resolve(this.manifestPath, entry.image),
      );

      yield {
        image,
        key: entry.key,
      };
    }
  }
}
