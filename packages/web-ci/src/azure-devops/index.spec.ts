import { createSandboxAsync, getFileContent } from '@objectivity/angular-schematic-utils/testing';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
const collectionPath = path.join(__dirname, '../collection.json');
import { Tree } from '@angular-devkit/schematics';

describe(`azure-devops`, () => {
    const projectName = 'sandbox';
    const testRunner = new SchematicTestRunner('schematics', collectionPath);

    let appTree: UnitTestTree;
    beforeEach(async () => {
        appTree = await createSandboxAsync(testRunner);
    });

    it(`should add azure-pipelines.yml`, async () => {
        const tree = await testRunner.runSchematicAsync('azure-devops', { project: projectName }, appTree).toPromise();
        expect(tree.files).toContain('/azure-pipelines.yml');
    });

    it(`should add azure-pipelines.yml`, async () => {
        const tree = await testRunner.runSchematicAsync('azure-devops', { project: projectName, workingDir: 'path' }, appTree).toPromise();
        expectFileContent(tree, '/azure-pipelines.yml', ` workingDir: 'path'`);
        expectFileContent(tree, '/azure-pipelines.yml', `summaryFileLocation: 'path/coverage/sandbox/cobertura-coverage.xml'`);
        expectFileContent(tree, '/azure-pipelines.yml', `rootFolderOrFile: 'path/dist/sandbox'`);
        expectFileContent(tree, '/azure-pipelines.yml', `archiveFile: '$(Build.ArtifactStagingDirectory)/sandbox.zip'`);
        expectFileContent(tree, '/azure-pipelines.yml', `ArtifactName: 'sandbox'`);
    });
});

function expectFileContent(tree: Tree, filePath: string, expectedContent: string) {
    expect(getFileContent(tree, filePath))
        .toContain(
            expectedContent, `Expected "${filePath}" to contain "${expectedContent}"`);
}
