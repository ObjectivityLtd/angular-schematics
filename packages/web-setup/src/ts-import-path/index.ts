import { Rule, SchematicContext, Tree, chain } from '@angular-devkit/schematics';
import { Schema } from './schema';
import { parseJsonAst } from '@angular-devkit/core';
import { appendPropertyInAstObject, findPropertyInAstObject, getWorkspace, getProjectFromWorkspace, buildDefaultPath } from 'schematics-utilities';
import { trimSlashes, getProjectEnvironmentPath } from '@objectivity/angular-schematic-utils';

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

        const tsConfigPath = 'tsconfig.json';
        try {
            const tsCfgJsonContent = tree.read(tsConfigPath);
            if (!tsCfgJsonContent) {
                throw new Error('Invalid path: ' + tsConfigPath);
            }

            const tsCfgAst = parseJsonAst(tsCfgJsonContent.toString('utf-8'));
            if (tsCfgAst.kind !== 'object') {
                throw new Error('Invalid tsconfig content.');
            }

            const compilerOptionsAstNode = findPropertyInAstObject(tsCfgAst, 'compilerOptions');

            if (!compilerOptionsAstNode || compilerOptionsAstNode.kind !== 'object') {
                throw new Error('Invalid compilerOptions content.');
            }

            const pathsAstNode = findPropertyInAstObject(compilerOptionsAstNode, 'paths');

            const recorder = tree.beginUpdate(tsConfigPath);

            if(!pathsAstNode) {
                appendPropertyInAstObject(recorder, compilerOptionsAstNode, "paths", pathToProject, 4);

            } else
            {
                            
                if (pathsAstNode.kind !== 'object') {
                    throw new Error('Invalid paths content.');
                }

                appendPropertyInAstObject(recorder, pathsAstNode, projectKey, pathToProject[projectKey], 4);
                appendPropertyInAstObject(recorder, pathsAstNode, projectEnvKey, pathToProject[projectEnvKey], 4);
            }
            tree.commitUpdate(recorder);

            return tree;

        } catch(e) {
            console.error(e);
            throw new Error(`Could not update ${tsConfigPath}`);
        }
    };
}
