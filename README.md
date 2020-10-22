# vrt.js

All visual regression testing libraries that I have seen are quite opinionated. For example, they only work with selenium, or only take screenshots of entire pages, or can only compare against baselines stored on the filesystem. This means deviating from their restrictions is difficult. vrt.js takes a more modular approach. You can think of it as a toolkit or framework for building a visual regression testing system yourself. Most of the behaviour is behind interfaces, their implementations specified in the configuration file.

## Concepts

* **Backend** - Something that yields screenshots. You will have one of these for either side of the comparison. Screenshots can come from anywhere - the filesystem, S3, a browser, etc. Screenshots have an associated key, which is an arbitrary dictionary of properties. This is used to pair screenshots yielded from the "before" and "after" backend.

## Installation

This project is composed of [many packages](./packages) in the `@vrt.js` namespace, so what you'll install depends on what you need. However, you'll probably need the following, along with any backends and reporters that you want to use:

```sh
yarn add @vrt.js/core @vrt.js/cli
```

or

```sh
npm install @vrt.js/core @vrt.js/cli
```

## Usage

Vrt.js is customised using a _configuration object_. The most common way of specifying this is by exporting it from a file then invoking the CLI with the filename.

For example, assume you have the file `config.js` in the current directory:

```js
const PuppeteerBrowser = require('@vrt.js/puppeteer-browser').default;
const PageBackend = require('@vrt.js/page-backend').default;
const { writeBaselines, FilesystemBackend } = require('@vrt.js/filesystem');
const { generateReport } = require('@vrt.js/website-reporter');

module.exports = {
    before: new PageBackend({
        browser: new PuppeteerBrowser({
            viewportWidth: 1920,
        }),
        urls: [`https://my-site.com/`],
        prefix: `https://my-site.com/`,
        discoverUrls: true,
    }),
    after: new FilesystemBackend('./baselines'),
    async report(report) {
        await writeBaselines(report, {
            directory: './baselines',
        });

        await generateReport(report, {
            outputDirectory: './report',
        });
    },
};
```

You can then invoke the CLI with this configuration by running:

```sh
vrt.js --config config.js
```
