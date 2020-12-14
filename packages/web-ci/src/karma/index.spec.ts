import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
const collectionPath = path.join(__dirname, '../collection.json');
import { Tree } from '@angular-devkit/schematics';
import { createSandboxAsync, createSandboxWorkspaceAsync, getFileContent, packageDevDependency } from '@objectivity/angular-schematic-utils/testing';

describe(`karma`, () => {
    const projectName = 'sandbox';
    const testRunner = new SchematicTestRunner('schematics', collectionPath);
    
    let appTree: UnitTestTree;
    beforeEach(async () => {
        appTree = await createSandboxAsync(testRunner);
    });

    it(`should install package when skipInstall option equals false`, async () => {
        var appTree = await createSandboxAsync(testRunner);
        await testRunner.runSchematicAsync('karma', { project: projectName, skipInstall: false }, appTree).toPromise();
        expect(testRunner.tasks.some(t => t.name === 'node-package')).toBe(true);    
    });

    it(`shouldn't install packages when skipInstall option equals true`, async () => {
        var appTree = await createSandboxAsync(testRunner);
        await testRunner.runSchematicAsync('karma', { project: projectName, skipInstall: true }, appTree).toPromise();
        expect(testRunner.tasks.length).toBe(0);         
    });

    it(`should add karma-junit-reporter package`, async () => {
        const tree = await testRunner.runSchematicAsync('karma', { project: projectName }, appTree).toPromise();
        expect(packageDevDependency(tree, 'karma-junit-reporter')).toBe('^2.0.1');
    });

    it(`should add jasmine-reporters package`, async () => {
        const tree = await testRunner.runSchematicAsync('karma', { project: projectName }, appTree).toPromise();
        expect(packageDevDependency(tree, 'jasmine-reporters')).toBe('^2.3.2');
    });
 
    it(`should add puppeteer package`, async () => {
        const tree = await testRunner.runSchematicAsync('karma', { project: projectName }, appTree).toPromise();
        expect(packageDevDependency(tree, 'puppeteer')).toBe('^5.5.0');
    });
    
    it(`should add JUnit folder to ignore`, async () => {
        const tree = await testRunner.runSchematicAsync('karma', { project: projectName }, appTree).toPromise();
        expectFileContent(tree, '/.gitignore', `/junit`);
    });
        
    it(`should add protractor-ci.config.js`, async () => {
        const tree = await testRunner.runSchematicAsync('karma', { project: projectName }, appTree).toPromise();
        expect(tree.files).toContain('/e2e/protractor-ci.conf.js');      
    });
        
    it(`should add karma-ci.conf.js`, async () => {
        const tree = await testRunner.runSchematicAsync('karma', { project: projectName }, appTree).toPromise();
        expect(tree.files).toContain('/karma-ci.conf.js');      
    });
          
    it(`should add new scripts to package.json`, async () => {
        const tree = await testRunner.runSchematicAsync('karma', { project: projectName }, appTree).toPromise();
        expectFileContent(tree, '/package.json', `"install-puppeteer": "cd node_modules/puppeteer && npm run install"`);
    });
    
    describe(`for multiple projects`, () => {
        beforeEach(async () => {
            appTree = await createSandboxWorkspaceAsync(testRunner);
        });

        it(`should add protractor-ci.config.js`, async () => {
            const tree = await testRunner.runSchematicAsync('karma', { project: projectName }, appTree).toPromise();
            expect(tree.files).toContain('/projects/sandbox/e2e/protractor-ci.conf.js');      
        });
                
        it(`should add karma-ci.conf.js`, async () => {
            const tree = await testRunner.runSchematicAsync('karma', { project: projectName }, appTree).toPromise();
            expect(tree.files).toContain('/projects/sandbox/karma-ci.conf.js');      
        });
    });    
});

function expectFileContent(tree: Tree, filePath: string, expectedContent: string) {
    expect(getFileContent(tree, filePath))
        .toContain(
            expectedContent, `Expected "${filePath}" to contain "${expectedContent}"`);
}
