import { getRunSchematic } from '@objectivity/angular-schematic-utils/testing';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { TaskConfiguration, Tree } from '@angular-devkit/schematics';

const collectionPath = path.join(__dirname, '../collection.json');

describe(`web-ci`, () => {
    const testRunner = new SchematicTestRunner('schematics', collectionPath);

    describe(`ng-add`, () => {

        it(`should execute 'karma' schematic`, async () => {
            const options = { project: 'sandbox', skipInstall: true };
            await testRunner.runSchematicAsync('ng-add', options, Tree.empty()).toPromise();
            assertRunSchematicTask<any>(testRunner.tasks, 'karma', options);
        });

        it(`ng-add executes 'vscode' schematic with empty configuration for empty option`, async () => {
            await testRunner.runSchematicAsync('ng-add', { project: 'sandbox', azureDevops: true }, Tree.empty()).toPromise();
            assertRunSchematicTask<any>(testRunner.tasks, 'azure-devops', { project: 'sandbox' });
        });

        it(`ng-add shouldn't execute 'vscode' schematic when vscode parameter equals 'false'`, async () => {
            await testRunner.runSchematicAsync('ng-add', { project: 'sandbox', azureDevops: false }, Tree.empty()).toPromise();
            assertNotRunSchematicTask(testRunner.tasks, 'azure-devops');
        });
    });
});

function assertRunSchematicTask<T>(tasks: TaskConfiguration<{}>[], schematic: string, options: T) {
    const task = getRunSchematic(tasks, schematic);
    expect(task).toBeDefined();
    expect(task.options).toEqual(options);
}

function assertNotRunSchematicTask(tasks: TaskConfiguration<{}>[], schematic: string) {
    const task = getRunSchematic(tasks, schematic);
    expect(task).not.toBeDefined();
}