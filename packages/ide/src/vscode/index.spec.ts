import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { createSandboxAsync } from '@objectivity/angular-schematic-utils/testing';
import * as path from 'path';

const collectionPath = path.join(__dirname, '../collection.json');

describe(`ide`, () => {
    const testRunner = new SchematicTestRunner('schematics', collectionPath);

    describe(`vscode`, () => {

        it('adds 3 files', async () => {
            const appTree = await createSandboxAsync(testRunner);

            const runner = new SchematicTestRunner('schematics', collectionPath);
            const tree = await runner.runSchematicAsync('vscode', { }, appTree).toPromise();
    
            expect(tree.files).toContain('/.vscode/extensions.json');
            expect(tree.files).toContain('/.vscode/launch.json');
            expect(tree.files).toContain('/.vscode/settings.json');
        });
    });
});
