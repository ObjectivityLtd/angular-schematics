import { Rule, SchematicContext, Tree, chain } from '@angular-devkit/schematics';
import { Schema } from './schema';
import { getWorkspace, buildDefaultPath } from 'schematics-utilities';
import { trimSlashes, getProjectEnvironmentPath, JSONFile } from '@objectivity/angular-schematic-utils';
import { getProjectFromWorkspace } from '@objectivity/angular-schematic-utils';

export function tsImportPath(options: Schema): Rule {
    return (_tree: Tree, _context: SchematicContext) => {
        return chain([
            updateTsConfig(options)
        ]);
    };
}

function updateTsConfig(options: Schema): Rule {
    return (tree: Tree, _context: SchematicContext) => {

        const workspace = getWorkspace(tree);
        const projectName = options.project;
        const workspaceProject = getProjectFromWorkspace(workspace, projectName);
        const projectPath = trimSlashes(buildDefaultPath(workspaceProject));
        const projectEnvPath = trimSlashes(getProjectEnvironmentPath(workspaceProject));

        const projectKey = `@${projectName}/*`;
        const projectEnvKey = `@${projectName}-env/*`;
        const pathToProject = {
            [projectKey]: [`${projectPath}/*`],
            [projectEnvKey]: [`${projectEnvPath}/*`],
        };

        const json = new JSONFile(tree, 'tsconfig.json');
    
        if (pathToProject) {
            json.modify(['compilerOptions', 'paths'], pathToProject);
        }
    }
}
