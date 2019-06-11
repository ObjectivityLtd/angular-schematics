import { Tree } from "@angular-devkit/schematics";
import { WorkspaceProject, buildDefaultPath } from "schematics-utilities";

export function getCoreModulePath(host: Tree, workspaceProject: WorkspaceProject): string | undefined {
    const projectPath = buildDefaultPath(workspaceProject);
    const coreModulePath = `${projectPath}/core/core.module.ts`;

    if(host.exists(coreModulePath)){
        return coreModulePath;
    }

    return undefined;
}
