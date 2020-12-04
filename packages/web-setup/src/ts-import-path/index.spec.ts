import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { JSONFile } from '@objectivity/angular-schematic-utils';
import { createSandboxAsync } from '@objectivity/angular-schematic-utils/testing';
import * as path from 'path';
const collectionPath = path.join(__dirname, '../collection.json');

describe(`web-setup`, () => {
    const testRunner = new SchematicTestRunner('schematics', collectionPath);
    const projectName = 'sandbox';
    
    describe(`ts-import-path`, () => {
        let appTree: UnitTestTree;
        beforeEach(async () => {
            appTree = await createSandboxAsync(testRunner);
        });
        
        it(`should update tsconfig.json`, async () => {
            const tree = await testRunner.runSchematicAsync('ts-import-path', { project: projectName }, appTree).toPromise();
            const json = new JSONFile(tree, 'tsconfig.json');
            expect(json.get(['compilerOptions', 'paths'])).toEqual({
                '@sandbox/*': [ 'src/app/*' ],
                '@sandbox-env/*': [ 'src/environments/*' ]
                });
        });
    });
});
