import { Rule, SchematicContext, Tree, chain, apply, url, applyTemplates, move, mergeWith, filter, noop } from '@angular-devkit/schematics';
import { Schema } from './schema';
import { getWorkspace, getProjectFromWorkspace, buildDefaultPath } from 'schematics-utilities';

export function monitoringModule(options: Schema): Rule {
    return (tree: Tree, _context: SchematicContext) => {
        const workspace = getWorkspace(tree);
        const projectName = options.project;
        const workspaceProject = getProjectFromWorkspace(workspace, projectName);
        const projectPath = buildDefaultPath(workspaceProject);
        
        // TODO: check if short path is configured
        const projectEnvImportPath = `@${options.project}-env/environment`;

        const templateSource = apply(url('./files'), [
            options.skipCoreModule ? filter(path => !path.endsWith('core.module.ts.template')) : noop(),
            applyTemplates({
                projectEnvImportPath
            }),
            move(projectPath)
        ]);
        return chain([
            mergeWith(templateSource)
        ]);
    };
}
