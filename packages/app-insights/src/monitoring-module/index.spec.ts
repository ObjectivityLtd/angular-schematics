import { createSandboxAsync, createSandboxWorkspaceAsync, getFileContentAsLineCollection } from '@objectivity/angular-schematic-utils/testing';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { Schema } from './schema';
const collectionPath = path.join(__dirname, '../collection.json');

describe(`app-insights`, () => {
    const testRunner = new SchematicTestRunner('schematics', collectionPath);
    
    let appTree: UnitTestTree;
    beforeEach(async () => {
        appTree = await createSandboxAsync(testRunner);
    });

    describe(`monitoring-module`, () => {

        it(`should create proper files`, async () => {
            const tree = await testRunner.runSchematicAsync<Schema>('monitoring-module', { project: 'sandbox', skipCoreModule: false }, appTree).toPromise();
            expect(tree.files).toContain('/src/app/core/monitoring/index.ts');
            expect(tree.files).toContain('/src/app/core/monitoring/monitoring.module.ts');
            expect(tree.files).toContain('/src/app/core/core.module.ts');
        });

        it(`should not create core module file when skipCoreModule equals true`, async () => {
            const tree = await testRunner.runSchematicAsync<Schema>('monitoring-module', { project: 'sandbox', skipCoreModule: true }, appTree).toPromise();
            expect(tree.files).not.toContain('/src/app/core/core.module.ts');
        });

        it(`should proper core module file`, async () => {
            const tree = await testRunner.runSchematicAsync<Schema>('monitoring-module', { project: 'sandbox', skipCoreModule: false }, appTree).toPromise();
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
                `  exports: [`,
                `    MonitoringModule`,
                `  ]`,
                `})`,
                `export class CoreModule { }`,
                ``]);
        });
        
        it(`should proper index file`, async () => {
            const tree = await testRunner.runSchematicAsync<Schema>('monitoring-module', { project: 'sandbox', skipCoreModule: false }, appTree).toPromise();
            const content = getFileContentAsLineCollection(tree, '/src/app/core/monitoring/index.ts');
            expect(content).toEqual([`export * from './monitoring.module';`, '']);
        });
                
        it(`should proper monitoring module file`, async () => {
            const tree = await testRunner.runSchematicAsync<Schema>('monitoring-module', { project: 'sandbox', skipCoreModule: false }, appTree).toPromise();
            const content = getFileContentAsLineCollection(tree, '/src/app/core/monitoring/monitoring.module.ts');
            expect(content).toEqual([
                `import { NgModule } from '@angular/core';`,
                `import { CommonModule } from '@angular/common';`,
                `import { ApplicationInsightsModule, AppInsightsService } from '@markpieszak/ng-application-insights';`,
                `import { environment } from '@sandbox-env/environment';`,
                ``,
                `@NgModule({`,
                `  declarations: [],`,
                `  imports: [`,
                `    CommonModule,`,
                `    ApplicationInsightsModule.forRoot({`,
                `      instrumentationKey: environment.appInsights.instrumentationKey`,
                `    })`,
                `  ],`,
                `  providers: [`,
                `    AppInsightsService`,
                `  ],`,
                `  exports: [`,
                `    ApplicationInsightsModule`,
                `  ]`,
                `})`,
                `export class MonitoringModule { }`,
                ``
            ]);
        });

        describe(`for multiple applications`, () => {
            let appTree: UnitTestTree;
            beforeEach(async () => {
                appTree = await createSandboxWorkspaceAsync(testRunner);
            });
            
            it(`should create proper files`, async () => {
                const tree = await testRunner.runSchematicAsync<Schema>('monitoring-module', { project: 'sandbox', skipCoreModule: false }, appTree).toPromise();
                expect(tree.files).toContain('/projects/sandbox/src/app/core/monitoring/index.ts');
                expect(tree.files).toContain('/projects/sandbox/src/app/core/monitoring/monitoring.module.ts');
                expect(tree.files).toContain('/projects/sandbox/src/app/core/core.module.ts');
            });
    
        });
    });
});
