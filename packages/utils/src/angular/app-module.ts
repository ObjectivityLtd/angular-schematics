import { SchematicsException, Tree } from "@angular-devkit/schematics";
import { addImportToModule, getAppModulePath, getSourceFile, WorkspaceProject } from "schematics-utilities";
import { getProjectMainFile } from "schematics-utilities/dist/cdk";

/* https://github.com/nitayneeman/schematics-utilities/issues/23 */
export function addModuleImportToRootModule(host: Tree, moduleName: string, src: string, project: WorkspaceProject) {
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