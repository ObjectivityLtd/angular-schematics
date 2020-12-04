import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { getRunSchematic } from '@objectivity/angular-schematic-utils/testing';
import { Tree } from '@angular-devkit/schematics';
const collectionPath = path.join(__dirname, '../collection.json');

describe(`ide`, () => {
    const testRunner = new SchematicTestRunner('schematics', collectionPath);

    describe(`ng-add`, () => {

        it(`should execute 'vscode' schematic with empty configuration when vscode equals 'true'`, async () => {
            await testRunner.runSchematicAsync('ng-add', { vscode: true }, Tree.empty()).toPromise();
            var vscodeSchematic = getRunSchematic<any>(testRunner.tasks, 'vscode');
            expect(vscodeSchematic).toBeDefined();
            expect(vscodeSchematic.options).toEqual({});
        });

        it(`ng-add executes 'vscode' schematic with empty configuration as default`, async () => {
            await testRunner.runSchematicAsync('ng-add', { }, Tree.empty()).toPromise();
            var vscodeSchematic = getRunSchematic<any>(testRunner.tasks, 'vscode');
            expect(vscodeSchematic).toBeDefined();
            expect(vscodeSchematic.options).toEqual({});
        });

        it(`ng-add shouldn't execute 'vscode' schematic when vscode parameter equals 'false'`, async () => {
            await testRunner.runSchematicAsync('ng-add', { vscode: false }, Tree.empty()).toPromise();
            expect(testRunner.tasks.length).toBe(0);
        });
    });
});
