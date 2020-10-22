import { Report } from '@vrt.js/core';
import fs from 'fs-extra';
import path from 'path';
import uuid from 'uuid/v4';
import { Manifest, getManifestPath } from './Manifest';

interface Config {
  directory: string;
}

export async function saveBaselines(report: Report, config: Config) {
  await fs.emptyDir(config.directory);

  const manifestPath = getManifestPath(config.directory);

  const manifest: Manifest = await Promise.all(
    report.screenshots.map(async (screenshot) => {
      const id = uuid();
      const screenshotPath = path.join(config.directory, `${id}.png`);

      await fs.writeFile(screenshotPath, screenshot.after);

      return {
        image: path.relative(manifestPath, screenshotPath),
        properties: screenshot.properties,
      };
    }),
  );

  await fs.writeFile(manifestPath, JSON.stringify(manifest), 'utf8');
}
