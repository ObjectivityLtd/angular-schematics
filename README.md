# Angular Schematics

Useful Angular schematics.

## Packages

This is a monorepo which contains many packages:

| Project | Package | Version | Links |
|---|---|---|---|
**ui-framework** | [`@objectivity/angular-schematic-ui-framework`](https://npmjs.com/package/@objectivity/angular-schematic-ui-framework) | [![latest](https://img.shields.io/npm/v/%40objectivity%2Fangular-schematic-ui-framework/latest.svg)](https://npmjs.com/package/@objectivity/angular-schematic-ui-framework) | [![README](https://img.shields.io/badge/README--green.svg)](/packages/ui-framework/README.md)
**web-ci** | [`@objectivity/angular-schematic-web-ci`](https://npmjs.com/package/@objectivity/angular-schematic-web-ci) | [![latest](https://img.shields.io/npm/v/%40objectivity%2Fangular-schematic-web-ci/latest.svg)](https://npmjs.com/package/@objectivity/angular-schematic-web-ci) | [![README](https://img.shields.io/badge/README--green.svg)](/packages/web-ci/README.md)
**ide** | [`@objectivity/angular-schematic-ide`](https://npmjs.com/package/@objectivity/angular-schematic-ide) | [![latest](https://img.shields.io/npm/v/%40objectivity%2Fangular-schematic-ide/latest.svg)](https://npmjs.com/package/@objectivity/angular-schematic-ide) | [![README](https://img.shields.io/badge/README--green.svg)](/packages/ide/README.md)
**app-insights** | [`@objectivity/angular-schematic-app-insights`](https://npmjs.com/package/@objectivity/angular-schematic-app-insights) | [![latest](https://img.shields.io/npm/v/%40objectivity%2Fangular-schematic-app-insights/latest.svg)](https://npmjs.com/package/@objectivity/angular-schematic-app-insights) | [![README](https://img.shields.io/badge/README--green.svg)](/packages/app-insights/README.md)
**web-setup** | [`@objectivity/angular-schematic-web-setup`](https://npmjs.com/package/@objectivity/angular-schematic-web-setup) | [![latest](https://img.shields.io/npm/v/%40objectivity%2Fangular-schematic-web-setup/latest.svg)](https://npmjs.com/package/@objectivity/angular-schematic-web-setup) | [![README](https://img.shields.io/badge/README--green.svg)](/packages/web-setup/README.md)
**starter-kit** | [`@objectivity/angular-schematic-starter-kit`](https://npmjs.com/package/@objectivity/angular-schematic-starter-kit) | [![latest](https://img.shields.io/npm/v/%40objectivity%2Fangular-schematic-starter-kit/latest.svg)](https://npmjs.com/package/@objectivity/angular-schematic-starter-kit) | [![README](https://img.shields.io/badge/README--green.svg)](/packages/starter-kit/README.md)
**utils** | [`@objectivity/angular-schematic-utils`](https://npmjs.com/package/@objectivity/angular-schematic-utils) | [![latest](https://img.shields.io/npm/v/%40objectivity%2Fangular-schematic-utils/latest.svg)](https://npmjs.com/package/@objectivity/angular-schematic-utils) | [![README](https://img.shields.io/badge/README--green.svg)](/packages/utils/README.md)

## Compatibility

Here is the versions compatibility list:

| @objectivity/angular-schematic-* |    Angular    |
| ------------- | ------------- |
| 11.x.x        | 11.x.x |
| 10.x.x        | 10.x.x |
| 9.x.x         | 9.x.x  |
| 8.xx          | 8.x.x  |

## Getting Started - Local Development

### Installation

To get started locally, follow these instructions:

1. If you haven't done it already, [make a fork of this repo](https://github.com/angular/angular-cli/fork).
1. Clone to your local computer using `git`.
1. Make sure that you have Node 10.9 or later installed. See instructions [here](https://nodejs.org/en/download/).
1. Make sure that you have `yarn` installed; see instructions [here](https://yarnpkg.com/lang/en/docs/install/).
1. Run `yarn` (no arguments) from the root of your clone of this project.
1. Run `yarn bootstrap` to link local packages together and install remaining package dependencies. [Read more](https://github.com/lerna/lerna/tree/master/commands/bootstrap).

### Sandbox project

The sandbox is a version controlled directory and contains an Angular application (v8.0.0).

For testing and development, you can execute your schematic against the application in the sandbox. Check out [this post on using a sandbox to develop an Angular Schematic](https://www.kevinschuchard.com/blog/2018-11-20-schematic-sandbox/).

#### Sandbox Preparation

1. Run `yarn` (no arguments) from the `sandbox` directory.
1. Run `yarn run link:all` to link schematic packages.
