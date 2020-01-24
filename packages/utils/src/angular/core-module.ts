import { Tree, SchematicsException } from "@angular-devkit/schematics";
import { addImportToModule, WorkspaceProject, getSourceFile, InsertChange, buildDefaultPath, addSymbolToNgModuleMetadata } from 'schematics-utilities';

export function getCoreModulePath(host: Tree, workspaceProject: WorkspaceProject): string | undefined {
    const projectPath = buildDefaultPath(workspaceProject);
    const coreModulePath = `${projectPath}/core/core.module.ts`;

    if (host.exists(coreModulePath)) {
        return coreModulePath;
    }

    return undefined;
}

export function coreModuleExists(host: Tree, workspaceProject: WorkspaceProject) {
    return  !!getCoreModulePath(host, workspaceProject);
}

export function addModuleToCoreModule(host: Tree, moduleName: string, src: string, workspaceProject: WorkspaceProject) {

    const coreModulePath = getCoreModulePath(host, workspaceProject);

    if (!coreModulePath) {
        throw new SchematicsException(`Module not found: ${coreModulePath}`);
    }
    const moduleSource = getSourceFile(host, coreModulePath) as any; // tsThirdParty.SourceFile;

    let changes = [
        ...addImportToModule(moduleSource, coreModulePath, moduleName, src),
        ...addSymbolToNgModuleMetadata(moduleSource, coreModulePath, 'exports', moduleName)
      ];
    const recorder = host.beginUpdate(coreModulePath);

    changes.forEach(change => {
        if (change instanceof InsertChange) {
            recorder.insertLeft(change.pos, change.toAdd);
        }
    });

    host.commitUpdate(recorder);
}