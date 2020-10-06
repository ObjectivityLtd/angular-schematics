import { Rule, SchematicContext, Tree, chain, apply, url, applyTemplates, mergeWith, move, SchematicsException } from '@angular-devkit/schematics';
import { Schema } from './schema';
import { getWorkspace, getProjectFromWorkspace, buildDefaultPath, getSourceFile, addImportToModule, WorkspaceProject, getAppModulePath } from 'schematics-utilities';
import { getProjectMainFile } from 'schematics-utilities/dist/cdk';
  
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

/* https://github.com/nitayneeman/schematics-utilities/issues/23 */
function addModuleImportToRootModule(host: Tree, moduleName: string, src: string, project: WorkspaceProject) {
    const modulePath = getAppModulePath(host, getProjectMainFile(project));
    const moduleSource = getSourceFile(host, modulePath);
  
    if (!moduleSource) {
      throw new SchematicsException(`Module not found: ${modulePath}`);
    }

    const changes = addImportToModule(<any>moduleSource, modulePath, moduleName, src);
    const recorder = host.beginUpdate(modulePath);
  
    changes.forEach(change => {
      {
        recorder.insertLeft((<any>change).pos, (<any>change).toAdd);
      }
    });
  
    host.commitUpdate(recorder);
}

function addCoreModule(options: Schema): Rule {
  return (host: Tree) => {
    const workspace = getWorkspace(host);
    const workspaceProject = getProjectFromWorkspace(workspace, options.project);

    addModuleImportToRootModule(host,'CoreModule', './core/core.module', workspaceProject);
    
    return host;
  };
}