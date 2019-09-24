import { WorkspaceProject } from "schematics-utilities";

/**
 * Build a root project path for generating.
 * @param project The project to build the path for.
 */
export function buildRootPath(project: WorkspaceProject): string {
    return project.sourceRoot ? `/${project.sourceRoot}` : `/${project.root}`;
  }