import { getRunSchematic } from '@objectivity/angular-schematic-utils/testing';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { TaskConfiguration, Tree } from '@angular-devkit/schematics';
import { Schema } from './schema';
const collectionPath = path.join(__dirname, '../collection.json');

describe(`web-setup`, () => {
    const testRunner = new SchematicTestRunner('schematics', collectionPath);
    const option = { project: 'sandbox' };

    describe(`ng-add`, () => {

        it(`should execute 'ts-import-path' schematic`, async () => {
            await testRunner.runSchematicAsync<Schema>('ng-add', option, Tree.empty()).toPromise();
            assertRunSchematicTask<any>(testRunner.tasks, 'ts-import-path', option);
        });

        it(`should execute 'ts-import-path' schematic`, async () => {
            await testRunner.runSchematicAsync<Schema>('ng-add', option, Tree.empty()).toPromise();
            assertRunSchematicTask<any>(testRunner.tasks, 'scss-import', option);
        });

        it(`should execute 'ts-import-path' schematic`, async () => {
            await testRunner.runSchematicAsync<Schema>('ng-add', option, Tree.empty()).toPromise();
            assertRunSchematicTask<any>(testRunner.tasks, 'structure', option);
        });
    });
});

function assertRunSchematicTask<T>(tasks: TaskConfiguration<{}>[], schematic: string, options: T) {
    const task = getRunSchematic(tasks, schematic);
    expect(task).toBeDefined();
    expect(task.options).toEqual(options);
}
