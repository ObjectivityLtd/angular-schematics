import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { TaskConfiguration } from '@angular-devkit/schematics';
import { Schema } from './schema';
const collectionPath = path.join(__dirname, '../collection.json');
import { createSandboxAsync, packageDependency, getRunSchematicAndCollection } from '@objectivity/angular-schematic-utils/testing';

describe(`ui-framework`, () => {
    const testRunner = new SchematicTestRunner('schematics', collectionPath);
    
    let appTree: UnitTestTree;
    beforeEach(async () => {
        appTree = await createSandboxAsync(testRunner);
    });

    describe(`material`, () => {

        it(`should execute 'ng-add' schematic from @angular/material collection with default options`, async () => {
            await testRunner.runSchematicAsync<Schema>('material', { project: 'sandbox', skipInstall: false }, appTree).toPromise();
            assertRunSchematicTask<any>(testRunner.tasks, '@angular/material', 'ng-add', {
                project: 'sandbox',
                skipInstall: false,
                theme: 'indigo-pink',
                typography: true,
                animations: true });
        });

        it(`should update the package.json`, async () => {
            const tree= await testRunner.runSchematicAsync<Schema>('material', { project: 'sandbox', skipInstall: false }, appTree).toPromise();
            expect(packageDependency(tree, '@angular/material')).toBe('^11.0.0');
        });

        it(`should install packages`, async () => {
            await testRunner.runSchematicAsync<Schema>('material', { project: 'sandbox', skipInstall: false }, appTree).toPromise();
            expect(testRunner.tasks.some(t => t.name === 'node-package')).toBe(true);  
        });
    });
});

function assertRunSchematicTask<T>(tasks: TaskConfiguration<{}>[], collection: string, schematic: string, options: T) {
    const task = getRunSchematicAndCollection(tasks, collection, schematic);
    expect(task).toBeDefined();
    expect(task.options).toEqual(options);
}
