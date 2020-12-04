import { createSandboxAsync, createSandboxWorkspaceAsync, getFileContent, packageDependency } from '@objectivity/angular-schematic-utils/testing';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
const collectionPath = path.join(__dirname, '../collection.json');
import { Tree } from '@angular-devkit/schematics';

describe(`ui-framework`, () => {
    const projectName = 'sandbox';
    const testRunner = new SchematicTestRunner('schematics', collectionPath);

    describe(`bootstrapMini`, () => {

        it('should update the package.json', async () => {
            var appTree = await createSandboxWorkspaceAsync(testRunner);
            const tree = await testRunner.runSchematicAsync('bootstrap-mini', { project: projectName }, appTree).toPromise();
            expect(packageDependency(tree, 'bootstrap')).toBe('^4.4.0');
        });

        it(`should install packages when skipInstall option equals false`, async () => {
            var appTree = await createSandboxWorkspaceAsync(testRunner);
            await testRunner.runSchematicAsync('bootstrap-mini', { project: projectName, skipInstall: false }, appTree).toPromise();
            expect(testRunner.tasks.some(t => t.name === 'node-package')).toBe(true);    
        });

        it(`shouldn't install packages when skipInstall option equals true`, async () => {
            var appTree = await createSandboxWorkspaceAsync(testRunner);
            await testRunner.runSchematicAsync('bootstrap-mini', { project: projectName, skipInstall: true }, appTree).toPromise();
            expect(testRunner.tasks.length).toBe(0);         
        });

        describe(`for multiple applications`, () => {
            let appTree: UnitTestTree;
            beforeEach(async () => {
                appTree = await createSandboxWorkspaceAsync(testRunner);
            });
            
            it(`shouldn add _bootstrap.scss file`, async () => {
                const tree = await testRunner.runSchematicAsync('bootstrap-mini', { project: projectName, skipInstall: true }, appTree).toPromise();
                expect(tree.files).toContain('/projects/sandbox/src/scss/_bootstrap.scss');      
            });
    
            it(`shouldn add import bootstrap.scss to main scss file`, async () => {
                const tree = await testRunner.runSchematicAsync('bootstrap-mini', { project: projectName, skipInstall: true }, appTree).toPromise();
                expectFileContent(tree, 'projects/sandbox/src/styles.scss', `@import 'scss/bootstrap.scss';`);
            });
        });

        describe(`for single application`, () => {
            let appTree: UnitTestTree;
            beforeEach(async () => {
                appTree = await createSandboxAsync(testRunner);
            });
            
            it(`shouldn add _bootstrap.scss file`, async () => {
                const tree = await testRunner.runSchematicAsync('bootstrap-mini', { project: projectName, skipInstall: true }, appTree).toPromise();
                expect(tree.files).toContain('/src/scss/_bootstrap.scss');      
            });
    
            it(`shouldn add import bootstrap.scss to main scss file`, async () => {
                const tree = await testRunner.runSchematicAsync('bootstrap-mini', { project: projectName, skipInstall: true }, appTree).toPromise();
                expectFileContent(tree, 'src/styles.scss', `@import 'scss/bootstrap.scss';`);
            });
        });
    });
});

function expectFileContent(tree: Tree, filePath: string, expectedContent: string) {
    expect(getFileContent(tree, filePath))
        .toContain(
            expectedContent, `Expected "${filePath}" to contain "${expectedContent}"`);
}
