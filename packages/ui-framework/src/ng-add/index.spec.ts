import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { TaskConfiguration, Tree } from '@angular-devkit/schematics';
import { Schema } from './schema';
import { getRunSchematic } from '@objectivity/angular-schematic-utils/testing';
const collectionPath = path.join(__dirname, '../collection.json');

describe(`ui-framework`, () => {
    const testRunner = new SchematicTestRunner('schematics', collectionPath);

    describe(`ng-add`, () => {

        it(`should execute 'material' schematic with project when 'materia;' option equals true`, async () => {
            await testRunner.runSchematicAsync<Schema>('ng-add', { bootstrapMini: false, skipInstall: true, project: 'projectName', material: true }, Tree.empty()).toPromise();
            assertRunSchematicTask<any>(testRunner.tasks, 'material', { project: 'projectName' });
        });

        it(`ng-add shouldn execute 'bootstrap-mini' schematic when bootstrapMini option equals 'false'`, async () => {
            const options = { bootstrapMini: true, skipInstall: true, project: 'project', material: false };

            await testRunner.runSchematicAsync<Schema>('ng-add', options, Tree.empty()).toPromise();
            assertRunSchematicTask<Schema>(testRunner.tasks, 'bootstrap-mini', options);
        });
        
        it(`ng-add shouldn't execute 'material' schematic when material option equals 'false'`, async () => {
            await testRunner.runSchematicAsync('ng-add', { material: false }, Tree.empty()).toPromise();
            assertNotRunSchematicTask(testRunner.tasks, 'material');
        });

        it(`ng-add shouldn't execute 'bootstrap-mini' schematic when bootstrapMini option equals 'false'`, async () => {
            await testRunner.runSchematicAsync('ng-add', { bootstrapMini: false }, Tree.empty()).toPromise();
            assertNotRunSchematicTask(testRunner.tasks, 'bootstrap-mini');
        });
    });
});

function assertNotRunSchematicTask(tasks: TaskConfiguration<{}>[], schematic: string) {
    const task = getRunSchematic(tasks, schematic);
    expect(task).not.toBeDefined();
}

function assertRunSchematicTask<T>(tasks: TaskConfiguration<{}>[], schematic: string, options: T) {
    const task = getRunSchematic(tasks, schematic);
    expect(task).toBeDefined();
    expect(task.options).toEqual(options);
}
