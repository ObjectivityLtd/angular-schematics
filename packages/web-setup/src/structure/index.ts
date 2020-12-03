import { Rule, SchematicContext, Tree, chain, apply, url, applyTemplates, mergeWith, move } from '@angular-devkit/schematics';
import { Schema } from './schema';
import { getWorkspace, getProjectFromWorkspace, buildDefaultPath } from 'schematics-utilities';;
import { addModuleImportToRootModule } from '@objectivity/angular-schematic-utils';
  
export function structure(options: Schema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const workspace = getWorkspace(tree);
    const projectName = options.project;
    const workspaceProject = getProjectFromWorkspace(workspace, projectName);
    const projectPath = buildDefaultPath(workspaceProject);

    const templateSource = apply(url('./files'), [
      applyTemplates({
        ...options
      }),
      move(projectPath)
    ]);
    return chain([
      mergeWith(templateSource),
      addCoreModule(options)
    ]);
  };
}

function addCoreModule(options: Schema): Rule {
  return (host: Tree) => {
    const workspace = getWorkspace(host);
    const workspaceProject = getProjectFromWorkspace(workspace, options.project);

    addModuleImportToRootModule(host,'CoreModule', './core/core.module', workspaceProject);
    
    return host;
  };
}