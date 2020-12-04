import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
const collectionPath = path.join(__dirname, '../collection.json');
import { Tree } from '@angular-devkit/schematics';
import { createSandboxAsync, createSandboxWorkspaceAsync, getFileContent, getFileContentAsLineCollection, packageDependency } from '@objectivity/angular-schematic-utils/testing';

describe(`karma`, () => {
    const projectName = 'sandbox';
    const testRunner = new SchematicTestRunner('schematics', collectionPath);
    
    let appTree: UnitTestTree;
    beforeEach(async () => {
        appTree = await createSandboxAsync(testRunner);
    });

    it(`should install package when skipInstall option equals false`, async () => {
        var appTree = await createSandboxAsync(testRunner);
        await testRunner.runSchematicAsync('karma', { project: projectName, skipInstall: false }, appTree).toPromise();
        expect(testRunner.tasks.some(t => t.name === 'node-package')).toBe(true);    
    });

    it(`shouldn't install packages when skipInstall option equals true`, async () => {
        var appTree = await createSandboxAsync(testRunner);
        await testRunner.runSchematicAsync('karma', { project: projectName, skipInstall: true }, appTree).toPromise();
        expect(testRunner.tasks.length).toBe(0);         
    });

    it(`should add karma-junit-reporter package`, async () => {
        const tree = await testRunner.runSchematicAsync('karma', { project: projectName }, appTree).toPromise();
        expect(packageDependency(tree, 'karma-junit-reporter')).toBe('^1.2.0');
    });

    it(`should add JUnit folder to ignore`, async () => {
        const tree = await testRunner.runSchematicAsync('karma', { project: projectName }, appTree).toPromise();
        expectFileContent(tree, '/.gitignore', `/junit`);
    });
        
    it(`should add protractor-ci.config.js`, async () => {
        const tree = await testRunner.runSchematicAsync('karma', { project: projectName }, appTree).toPromise();
        expect(tree.files).toContain('/e2e/protractor-ci.conf.js');      
    });
    
    describe(`for multiple projects`, () => {
        beforeEach(async () => {
            appTree = await createSandboxWorkspaceAsync(testRunner);
        });

        it(`should add protractor-ci.config.js`, async () => {
            const tree = await testRunner.runSchematicAsync('karma', { project: projectName }, appTree).toPromise();
            expect(tree.files).toContain('/projects/sandbox/e2e/protractor-ci.conf.js');      
        });

        it(`should update karma configuration`, async () => {
            const tree = await testRunner.runSchematicAsync('karma', { project: projectName }, appTree).toPromise();
            expect(getFileContentAsLineCollection(tree, '/projects/sandbox/karma.conf.js')).toEqual([
                `// Karma configuration file, see link for more information`,
                `// https://karma-runner.github.io/1.0/config/configuration-file.html`,
                ``,
                `module.exports = function (config) {`,
                `  config.set({`,
                `    junitReporter: { outputDir: '../../junit' },`,
                `    basePath: '',`,
                `    frameworks: ['jasmine', '@angular-devkit/build-angular'],`,
                `    plugins: [`,
                `      require('karma-jasmine'),`,
                `      require('karma-chrome-launcher'),`,
                `      require('karma-jasmine-html-reporter'),`,
                `      require('karma-coverage-istanbul-reporter'),`,
                `      require('karma-junit-reporter'),`,
                `      require('@angular-devkit/build-angular/plugins/karma')`,
                `    ],`,
                `    client: {`,
                `      clearContext: false // leave Jasmine Spec Runner output visible in browser`,
                `    },`,
                `    coverageIstanbulReporter: {`,
                `      dir: require('path').join(__dirname, '../../coverage/sandbox'),`,
                `      reports: ['cobertura','html', 'lcovonly', 'text-summary'],`,
                `      fixWebpackSourcePaths: true`,
                `    },`,
                `    reporters: ['junit','progress', 'kjhtml'],`,
                `    port: 9876,`,
                `    colors: true,`,
                `    logLevel: config.LOG_INFO,`,
                `    autoWatch: true,`,
                `    browsers: ['Chrome'],`,
                `    singleRun: false,`,
                `    customLaunchers: {`,
                `      ChromeHeadlessCI: {`,
                `        base: 'ChromeHeadless',`,
                `        flags: ['--no-sandbox']`,
                `      }`,
                `    },`,
                `    restartOnFileChange: true`,
                `  });`,
                `};`,
                ``
            ]);
        });
    });

    it(`should update karma configuration`, async () => {
        const tree = await testRunner.runSchematicAsync('karma', { project: projectName }, appTree).toPromise();
        expect(getFileContentAsLineCollection(tree, '/karma.conf.js')).toEqual([
            `// Karma configuration file, see link for more information`,
            `// https://karma-runner.github.io/1.0/config/configuration-file.html`,
            ``,
            `module.exports = function (config) {`,
            `  config.set({`,
            `    junitReporter: { outputDir: './junit' },`,
            `    basePath: '',`,
            `    frameworks: ['jasmine', '@angular-devkit/build-angular'],`,
            `    plugins: [`,
            `      require('karma-jasmine'),`,
            `      require('karma-chrome-launcher'),`,
            `      require('karma-jasmine-html-reporter'),`,
            `      require('karma-coverage-istanbul-reporter'),`,
            `      require('karma-junit-reporter'),`,
            `      require('@angular-devkit/build-angular/plugins/karma')`,
            `    ],`,
            `    client: {`,
            `      clearContext: false // leave Jasmine Spec Runner output visible in browser`,
            `    },`,
            `    coverageIstanbulReporter: {`,
            `      dir: require('path').join(__dirname, './coverage/sandbox'),`,
            `      reports: ['cobertura','html', 'lcovonly', 'text-summary'],`,
            `      fixWebpackSourcePaths: true`,
            `    },`,
            `    reporters: ['junit','progress', 'kjhtml'],`,
            `    port: 9876,`,
            `    colors: true,`,
            `    logLevel: config.LOG_INFO,`,
            `    autoWatch: true,`,
            `    browsers: ['Chrome'],`,
            `    singleRun: false,`,
            `    customLaunchers: {`,
            `      ChromeHeadlessCI: {`,
            `        base: 'ChromeHeadless',`,
            `        flags: ['--no-sandbox']`,
            `      }`,
            `    },`,
            `    restartOnFileChange: true`,
            `  });`,
            `};`,
            ``
        ]);
    });
    
});

function expectFileContent(tree: Tree, filePath: string, expectedContent: string) {
    expect(getFileContent(tree, filePath))
        .toContain(
            expectedContent, `Expected "${filePath}" to contain "${expectedContent}"`);
}
