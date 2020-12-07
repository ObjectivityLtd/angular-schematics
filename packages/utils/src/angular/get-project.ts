import { SchematicsException } from "@angular-devkit/schematics";
import { WorkspaceProject, WorkspaceSchema } from "schematics-utilities";

export function getProjectFromWorkspace(workspace: WorkspaceSchema, projectName?: string): WorkspaceProject {
    const project = workspace.projects[projectName || workspace.defaultProject!];

    if (!project) {
        throw new SchematicsException(`Could not find project in workspace: ${projectName}`);
    }

    return project;
}