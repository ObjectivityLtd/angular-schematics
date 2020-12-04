import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { Schema as ApplicationOptions, Style } from '@schematics/angular/application/schema';
import { Schema as WorkspaceOptions } from '@schematics/angular/workspace/schema';

export async function createSandboxAsync(testRunner: SchematicTestRunner) {

    const workspaceOptions: WorkspaceOptions = {
        name: 'sandbox',
        newProjectRoot: '',
        version: '6.0.0'
    };

    const appOptions: ApplicationOptions = {
        name: 'sandbox',
        style: Style.Scss,
        projectRoot: '',
    };

    let appTree = await testRunner.runExternalSchematicAsync('@schematics/angular', 'workspace', workspaceOptions).toPromise();
    appTree = await testRunner.runExternalSchematicAsync('@schematics/angular', 'application', appOptions, appTree).toPromise();
    return appTree;
}

export async function createSandboxWorkspaceAsync(testRunner: SchematicTestRunner) {

    const workspaceOptions: WorkspaceOptions = {
        name: 'sandboxworkspace',
        newProjectRoot: 'projects',
        version: '6.0.0'
    };

    const appOptions: ApplicationOptions = {
        name: 'sandbox',
        style: Style.Scss,
        routing: true
    };

    let appTree = await testRunner.runExternalSchematicAsync('@schematics/angular', 'workspace', workspaceOptions).toPromise();
    appTree = await testRunner.runExternalSchematicAsync('@schematics/angular', 'application', appOptions, appTree).toPromise();
    appTree = await testRunner.runExternalSchematicAsync('@schematics/angular', 'application', { ...appOptions, name: 'sandbox2' }, appTree).toPromise();
    return appTree;
}
