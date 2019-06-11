import { Tree } from "@angular-devkit/schematics";
import { WorkspaceProject, getAppModulePath as getAppModulePathUtil } from "schematics-utilities";
import { getProjectTargetOptions } from "./project-targets";

export function getAppModulePath(host: Tree, workspaceProject: WorkspaceProject) {
    return getAppModulePathUtil(host, getProjectTargetOptions(workspaceProject, "build").main);
}
