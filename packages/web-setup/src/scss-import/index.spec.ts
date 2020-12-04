import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { Schema } from './schema';
const collectionPath = path.join(__dirname, '../collection.json');
import { getProjectTargetOptions } from '@objectivity/angular-schematic-utils';
import { getProjectFromWorkspace, getWorkspace } from 'schematics-utilities';
import { createSandboxAsync, createSandboxWorkspaceAsync } from '@objectivity/angular-schematic-utils/testing';

describe(`web-setup`, () => {
    const testRunner = new SchematicTestRunner('schematics', collectionPath);
    
    describe(`scss-import`, () => {

        it(`should update includePaths`, async () => {
            const appTree = await createSandboxAsync(testRunner);
            const tree = await testRunner.runSchematicAsync<Schema>('scss-import', { project: 'sandbox' }, appTree).toPromise();
            const workspace = await getWorkspace(tree);
            const project = getProjectFromWorkspace(workspace);
            expect(getProjectTargetOptions(project, 'build').stylePreprocessorOptions.includePaths).toContain('src/app/scss');
            expect(getProjectTargetOptions(project, 'test').stylePreprocessorOptions.includePaths).toContain('src/app/scss');
        });

        it(`should update includePaths only for project from option`, async () => {
            const appTree = await createSandboxWorkspaceAsync(testRunner);
            const tree = await testRunner.runSchematicAsync<Schema>('scss-import', { project: 'sandbox2' }, appTree).toPromise();
            const workspace = await getWorkspace(tree);

            let project = getProjectFromWorkspace(workspace, 'sandbox2');
            expect(getProjectTargetOptions(project, 'build').stylePreprocessorOptions.includePaths).toContain('src/app/scss');
            expect(getProjectTargetOptions(project, 'test').stylePreprocessorOptions.includePaths).toContain('src/app/scss');

            project = getProjectFromWorkspace(workspace, 'sandbox');
            expect(getProjectTargetOptions(project, 'build').stylePreprocessorOptions).toBeUndefined();
            expect(getProjectTargetOptions(project, 'test').stylePreprocessorOptions).toBeUndefined();
        });
    });
});
