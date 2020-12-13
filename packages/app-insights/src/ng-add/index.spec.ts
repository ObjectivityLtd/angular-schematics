import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { Schema } from './schema';
import { createSandboxAsync, createSandboxWorkspaceAsync, packageDependency, getFileContentAsLineCollection, getRunSchematic, createFile } from '@objectivity/angular-schematic-utils/testing';
import { Tree } from '@angular-devkit/schematics';
const collectionPath = path.join(__dirname, '../collection.json');

describe(`app-insights`, () => {
    const testRunner = new SchematicTestRunner('schematics', collectionPath);
    
    let appTree: UnitTestTree;
    beforeEach(async () => {
        appTree = await createSandboxAsync(testRunner);
    });

    describe(`ng-add`, () => {
        it(`ng-add should execute 'monitoring-module'`, async () => {
            const options = { instrumentationKey: 'instrumentationKey', project: 'sandbox', skipInstall: false };

            await testRunner.runSchematicAsync<Schema>('ng-add', options, appTree).toPromise();
            var monitoringModule = getRunSchematic<Schema>(testRunner.tasks, 'monitoring-module');
            expect(monitoringModule).toBeDefined();
            expect(monitoringModule.options).toEqual({ ...options, ... { skipCoreModule: false } });
        });

        it(`ng-add update app.module when core module does not exist`, async () => {
            const options = { instrumentationKey: 'instrumentationKey', project: 'sandbox', skipInstall: false };

            const tree = await testRunner.runSchematicAsync<Schema>('ng-add', options, appTree).toPromise();
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

        it(`ng-add should execute 'monitoring-module' with skipCoreModule equals true when file core.module exists and update it`, async () => {
            createFile(appTree, '/src/app/core/core.module.ts',
            [`import { NgModule } from '@angular/core';`,
                `import { CommonModule } from '@angular/common';`,
                ``,
                `@NgModule({`,
                `  declarations: [],`,
                `  imports: [`,
                `    CommonModule`,
                `  ],`,
                `  exports: []`,
                `})`,
                `export class CoreModule { }`,
                ``]);

            const options = { instrumentationKey: 'instrumentationKey', project: 'sandbox', skipInstall: false };

            const tree = await testRunner.runSchematicAsync<Schema>('ng-add', options, appTree).toPromise();
            const content = getFileContentAsLineCollection(tree, '/src/app/core/core.module.ts');
            expect(content).toEqual(
                [`import { NgModule } from '@angular/core';`,
                `import { CommonModule } from '@angular/common';`,
                `import { MonitoringModule } from './monitoring';`,
                ``,
                `@NgModule({`,
                `  declarations: [],`,
                `  imports: [`,
                `    CommonModule,`,
                `    MonitoringModule`,
                `  ],`,
                `  exports: [MonitoringModule]`,
                `})`,
                `export class CoreModule { }`,
                ``]);
        });
        
        it(`should update the package.json`, async () => {
            const options = { instrumentationKey: 'instrumentationKey', project: 'sandbox', skipInstall: false };
            const tree = await testRunner.runSchematicAsync<Schema>('ng-add', options, appTree).toPromise();
            expect(packageDependency(tree, '@markpieszak/ng-application-insights')).toBe('^8.0.3');
        });

        it(`should install dependences`, async () => {
            const options = { instrumentationKey: 'instrumentationKey', project: 'sandbox', skipInstall: false };
            await testRunner.runSchematicAsync<Schema>('ng-add', options, appTree).toPromise();
            expect(testRunner.tasks.some(t => t.name === 'node-package')).toBe(true);
        });

        it(`shouldn't  install dependences when skipInstall is defined`, async () => {
            const options = { instrumentationKey: 'instrumentationKey', project: 'sandbox', skipInstall: true };
            await testRunner.runSchematicAsync<Schema>('ng-add', options, appTree).toPromise();
            expect(testRunner.tasks.some(t => t.name === 'node-package')).toBe(false);
        });
        
        it(`should update environment files`, async () => {
            const options = { instrumentationKey: 'instrumentationKey', project: 'sandbox', skipInstall: true };
            const tree = await testRunner.runSchematicAsync<Schema>('ng-add', options, appTree).toPromise();
            testEnvironmentFiles(tree, '/src');
        });
        
        it(`should update environment files for multiple projects`, async () => {
            appTree = await createSandboxWorkspaceAsync(testRunner);
            const options = { instrumentationKey: 'instrumentationKey', project: 'sandbox', skipInstall: true };
            const tree = await testRunner.runSchematicAsync<Schema>('ng-add', options, appTree).toPromise();
            testEnvironmentFiles(tree, '/projects/sandbox/src');
        });        
    });
});

function testEnvironmentFiles(tree: Tree, path: string) {
        const content = getFileContentAsLineCollection(tree, `${path}/environments/environment.ts`);
        expect(content).toContain(`export const environment = {`);
        expect(content).toContain( `  production: false,`);
        expect(content).toContain(`  appInsights: {`);
        expect(content).toContain(`    instrumentationKey: 'instrumentationKey'`);
        expect(content).toContain(`  }`);
        expect(content).toContain(`};`);

        const prodContent = getFileContentAsLineCollection(tree, `${path}/environments/environment.prod.ts`);
        expect(prodContent).toContain(`export const environment = {`);
        expect(prodContent).toContain( `  production: true,`);
        expect(prodContent).toContain(`  appInsights: {`);
        expect(prodContent).toContain(`    instrumentationKey: 'instrumentationKey'`);
        expect(prodContent).toContain(`  }`);
        expect(prodContent).toContain(`};`);
}
