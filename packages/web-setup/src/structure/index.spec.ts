import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
const collectionPath = path.join(__dirname, '../collection.json');
import { createSandboxAsync, createSandboxWorkspaceAsync, getFileContentAsLineCollection } from '@objectivity/angular-schematic-utils/testing';

describe(`web-setup`, () => {
    const testRunner = new SchematicTestRunner('schematics', collectionPath);
    const projectName = 'sandbox';
    
    describe(`structure`, () => {
        describe(`for single application`, () => {
            let appTree: UnitTestTree;
            beforeEach(async () => {
                appTree = await createSandboxAsync(testRunner);
            });
            
            it(`shouldn add files`, async () => {
                const tree = await testRunner.runSchematicAsync('structure', { project: projectName }, appTree).toPromise();
                expect(tree.files).toContain('/src/app/core/core.module.ts');
                expect(tree.files).toContain('/src/app/modules/.gitkeep');
                expect(tree.files).toContain('/src/app/scss/_variables.scss');
                expect(tree.files).toContain('/src/app/scss/components/.gitkeep');
            });

            it(`shouldn update app.module`, async () => {
                const tree = await testRunner.runSchematicAsync('structure', { project: projectName }, appTree).toPromise();
                const content = getFileContentAsLineCollection(tree, '/src/app/app.module.ts');
                expect(content).toEqual(
                    [`import { BrowserModule } from '@angular/platform-browser';`,
                    `import { NgModule } from '@angular/core';`,
                    ``,
                    `import { AppComponent } from './app.component';`,
                    `import { CoreModule } from './core/core.module';`,
                    ``,
                    `@NgModule({`,
                    `  declarations: [`,
                    `    AppComponent`,
                    `  ],`,
                    `  imports: [`,
                    `    BrowserModule,`,
                    `    CoreModule`,
                    `  ],`,
                    `  providers: [],`,
                    `  bootstrap: [AppComponent]`,
                    `})`,
                    `export class AppModule { }`,
                    ``]);
            });
        });
        
        describe(`for multiple applications`, () => {
            let appTree: UnitTestTree;
            beforeEach(async () => {
                appTree = await createSandboxWorkspaceAsync(testRunner);
            });
            
            it(`shouldn add files`, async () => {
                const tree = await testRunner.runSchematicAsync('structure', { project: projectName }, appTree).toPromise();
                expect(tree.files).toContain('/projects/sandbox/src/app/core/core.module.ts');
                expect(tree.files).toContain('/projects/sandbox/src/app/modules/.gitkeep');
                expect(tree.files).toContain('/projects/sandbox/src/app/scss/_variables.scss');
                expect(tree.files).toContain('/projects/sandbox/src/app/scss/components/.gitkeep');
            });

            it(`shouldn update app.module`, async () => {
                const tree = await testRunner.runSchematicAsync('structure', { project: projectName }, appTree).toPromise();
                const content = getFileContentAsLineCollection(tree, '/projects/sandbox/src/app/app.module.ts');
                expect(content).toEqual(
                    [`import { BrowserModule } from '@angular/platform-browser';`,
                    `import { NgModule } from '@angular/core';`,
                    ``,
                    `import { AppRoutingModule } from './app-routing.module';`,
                    `import { AppComponent } from './app.component';`,
                    `import { CoreModule } from './core/core.module';`,
                    ``,
                    `@NgModule({`,
                    `  declarations: [`,
                    `    AppComponent`,
                    `  ],`,
                    `  imports: [`,
                    `    BrowserModule,`,
                    `    AppRoutingModule,`,
                    `    CoreModule`,
                    `  ],`,
                    `  providers: [],`,
                    `  bootstrap: [AppComponent]`,
                    `})`,
                    `export class AppModule { }`,
                    ``]);
            });
        });
    });
});
