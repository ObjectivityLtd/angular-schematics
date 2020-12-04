import { createSandboxAsync, getRunSchematicAndCollection, packageDevDependency } from '@objectivity/angular-schematic-utils/testing';
import { TaskConfiguration } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
const collectionPath = path.join(__dirname, '../collection.json');
const { version } = require('../../package.json')

describe(`starter-kit`, () => {
    const testRunner = new SchematicTestRunner('schematics', collectionPath);
    const projectName = 'sandbox';
    let appTree: UnitTestTree;
    beforeEach(async () => {
        appTree = await createSandboxAsync(testRunner);
    });

    it(`should execute '@objectivity/angular-schematic-web-setup' schematic when setup equals 'true'`, async () => {

        await testRunner.runSchematicAsync('ng-add', { setup: true }, appTree).toPromise();
        assertRunSchematicTask<any>(testRunner.tasks, '@objectivity/angular-schematic-web-setup', 'ng-add', {});
        expect(packageDevDependency(appTree, '@objectivity/angular-schematic-web-setup')).toBe(version);
    });

    it(`should execute '@objectivity/angular-schematic-ui-framework' schematic when uiFramework equals 'true'`, async () => {

        await testRunner.runSchematicAsync('ng-add', { uiFramework: true, project: projectName }, appTree).toPromise();
        assertRunSchematicTask<any>(testRunner.tasks, '@objectivity/angular-schematic-ui-framework', 'ng-add', { project: projectName, skipInstall: true });
        expect(packageDevDependency(appTree, '@objectivity/angular-schematic-ui-framework')).toBe(version);
    });

    it(`should execute '@objectivity/angular-schematic-web-ci' schematic when uiFramework equals 'true'`, async () => {

        await testRunner.runSchematicAsync('ng-add', { ci: true, project: projectName }, appTree).toPromise();
        assertRunSchematicTask<any>(testRunner.tasks, '@objectivity/angular-schematic-web-ci', 'ng-add', { project: projectName, skipInstall: true });
        expect(packageDevDependency(appTree, '@objectivity/angular-schematic-web-ci')).toBe(version);
    });
   
    it(`should execute '@objectivity/angular-schematic-ide' schematic when ide equals 'true'`, async () => {

        await testRunner.runSchematicAsync('ng-add', { ide: true }, appTree).toPromise();
        assertRunSchematicTask<any>(testRunner.tasks, '@objectivity/angular-schematic-ide', 'ng-add', {});
        expect(packageDevDependency(appTree, '@objectivity/angular-schematic-ide')).toBe(version);
    });
    
    it(`should execute '@objectivity/angular-schematic-app-insights' schematic when uiFramework equals 'true'`, async () => {

        await testRunner.runSchematicAsync('ng-add', { appInsights: true, project: projectName }, appTree).toPromise();
        assertRunSchematicTask<any>(testRunner.tasks, '@objectivity/angular-schematic-app-insights', 'ng-add', { project: projectName, skipInstall: true });
        expect(packageDevDependency(appTree, '@objectivity/angular-schematic-app-insights')).toBe(version);
    });

    it(`should not install packages when any schematics won't be executed`, async () => {

        await testRunner.runSchematicAsync('ng-add', { project: projectName, setup: false, uiFramework: false, ci: false, ide: false, appInsights: false }, appTree).toPromise();
        expect(testRunner.tasks.some(t => t.name === 'node-package')).toBe(false);
        expect(packageDevDependency(appTree, '@objectivity/angular-schematic-app-insights')).toBeUndefined();
        expect(packageDevDependency(appTree, '@objectivity/angular-schematic-web-setup')).toBeUndefined();
        expect(packageDevDependency(appTree, '@objectivity/angular-schematic-ui-framework')).toBeUndefined();
        expect(packageDevDependency(appTree, '@objectivity/angular-schematic-web-ci')).toBeUndefined();
        expect(packageDevDependency(appTree, '@objectivity/angular-schematic-ide')).toBeUndefined();
    });
});

function assertRunSchematicTask<T>(tasks: TaskConfiguration<{}>[], collection: string, schematic: string, options: T) {
    const task = getRunSchematicAndCollection(tasks, collection, schematic);
    expect(task).toBeDefined();
    expect(task.options).toEqual(options);
}
