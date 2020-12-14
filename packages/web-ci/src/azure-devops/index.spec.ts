import { createSandboxAsync, createSandboxWorkspaceAsync, getFileContent } from '@objectivity/angular-schematic-utils/testing';
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
        expectFileContent(tree, '/azure-pipelines.yml', `name: Sandbox Angular App $(BuildID)`);
        expectFileContent(tree, '/azure-pipelines.yml', `summaryFileLocation: '$(Build.SourcesDirectory)/coverage/sandbox/cobertura-coverage.xml'`);
        expectFileContent(tree, '/azure-pipelines.yml', `rootFolderOrFile: 'path/dist/sandbox'`);
        expectFileContent(tree, '/azure-pipelines.yml', `archiveFile: '$(Build.ArtifactStagingDirectory)/sandbox.zip'`);
        expectFileContent(tree, '/azure-pipelines.yml', `ArtifactName: 'sandbox'`);
        expectFileContent(tree, '/azure-pipelines.yml', `customCommand: 'run ng lint sandbox'`);
        expectFileContent(tree, '/azure-pipelines.yml', `npm run ng e2e sandbox -- --protractor-config=e2e/protractor-ci.conf.js`);
        expectFileContent(tree, '/azure-pipelines.yml', `run ng test sandbox -- --karma-config=karma-ci.conf.js --code-coverage --no-progress --source-map=false`);
        expectFileContent(tree, '/azure-pipelines.yml', `run ng build sandbox -- --prod --aot -vc -cc --buildOptimizer --progress=false`);
        //expectFileContent(tree, '/azure-pipelines.yml', `npm run ng e2e sandbox -- --protractor-config=projects/sandbox/e2e/protractor-ci.conf.js`);
    });

    describe(`for multiple projects`, () => {
        beforeEach(async () => {
            appTree = await createSandboxWorkspaceAsync(testRunner);
        });
        it(`should add azure-pipelines.yml`, async () => {
            const tree = await testRunner.runSchematicAsync('azure-devops', { project: projectName, workingDir: 'path' }, appTree).toPromise();
            expectFileContent(tree, '/azure-pipelines.yml', `npm run ng e2e sandbox -- --protractor-config=projects/sandbox/e2e/protractor-ci.conf.js`);
            expectFileContent(tree, '/azure-pipelines.yml', `run ng test sandbox -- --karma-config=projects/sandbox/karma-ci.conf.js --code-coverage --no-progress --source-map=false`);
        });
    });  
});

function expectFileContent(tree: Tree, filePath: string, expectedContent: string) {
    expect(getFileContent(tree, filePath))
        .toContain(
            expectedContent, `Expected "${filePath}" to contain "${expectedContent}"`);
}
