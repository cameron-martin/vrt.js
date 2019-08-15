import { Reporter, Report } from '@vrt.js/core';
import fs from 'fs-extra';
import path from 'path';
import uuid from 'uuid/v4';
import { Manifest, getManifestPath } from './Manifest';

interface Config {
  directory: string;
  if(): boolean;
}

export default class FilesystemReporter implements Reporter {
  constructor(private readonly config: Config) {}

  async report(report: Report): Promise<void> {
    if (!this.config.if()) return;

    await fs.emptyDir(this.config.directory);

    const manifestPath = getManifestPath(this.config.directory);

    const manifest: Manifest = await Promise.all(
      report.screenshots.map(async screenshot => {
        const id = uuid();
        const screenshotPath = path.join(this.config.directory, `${id}.png`);

        await fs.writeFile(screenshotPath, screenshot.after);

        return {
          image: path.relative(manifestPath, screenshotPath),
          key: screenshot.key,
        };
      }),
    );

    await fs.writeFile(manifestPath, JSON.stringify(manifest), 'utf8');
  }
}
