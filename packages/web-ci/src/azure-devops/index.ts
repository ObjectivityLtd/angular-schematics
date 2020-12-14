import { Rule, SchematicContext, Tree, chain, apply, url, applyTemplates, move, mergeWith } from '@angular-devkit/schematics';
import { normalize, strings } from '@angular-devkit/core';
import { Schema } from './schema';
import { overwriteIfExists, getProjectTargetOptions, getProjectFromWorkspace } from '@objectivity/angular-schematic-utils';
import { getWorkspace, WorkspaceProject } from 'schematics-utilities';

export function azureDevOps(options: Schema): Rule {
    return (tree: Tree, _context: SchematicContext) => {
        return chain([
            createVstsCiBuildYamlFile(tree, options)
        ]);
    };
}

function createVstsCiBuildYamlFile(tree: Tree, options: Schema) {
    const templateSource = apply(url('./files'), [
        applyTemplates({
            ...strings,
            ...options,
            ...getPaths(tree, options)
        }),
        move('.'),
        overwriteIfExists(tree)
    ]);
    return chain([
        mergeWith(templateSource)
    ]);
}

function getPaths(host: Tree, options: Schema) {
    const workspace = getWorkspace(host);
    const projectName = options.project;
    const workspaceProject = getProjectFromWorkspace(workspace, projectName);
    const karmaPath = getProjectKarmaPath(workspaceProject);
    const protractorPath = getProjectProtractorPath(workspaceProject);

    return {
        karmaConfigPath: karmaPath,
        protractorConfigPath: protractorPath,
    }
}

function getProjectKarmaPath(project: WorkspaceProject): string {
    const testOptions = getProjectTargetOptions(project, 'test');

    const karmaConfigFile = normalize(testOptions.karmaConfig);
    return karmaConfigFile.replace('karma.conf.js', 'karma-ci.conf.js');
}

function getProjectProtractorPath(project: WorkspaceProject): string {
    const testOptions = getProjectTargetOptions(project, 'e2e');

    const protractorConfigFile = normalize(testOptions.protractorConfig);
    return protractorConfigFile.replace('protractor.conf.js', 'protractor-ci.conf.js');
}

