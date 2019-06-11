import { Rule, SchematicContext, Tree, apply, url, move, chain, branchAndMerge, mergeWith, applyTemplates, SchematicsException } from '@angular-devkit/schematics';
import { getProjectFromWorkspace, WorkspaceProject, getWorkspace } from "schematics-utilities";

export function vscode(_options: any): Rule {
  return (host: Tree, _context: SchematicContext) => {

    const serveOptions = getServeOptions(host);

    const templateServeOptions = {
      servePort: serveOptions.port || 4200,
      serveProtocol: serveOptions.ssl === true ? 'https' : 'http',
      serveDomain: serveOptions.host || 'localhost'
    };

    const templateTestOptions = {
      testProtocol: 'http',
      testDomain: 'localhost',
      testPort: 9876
    };

    const templateSource = apply(url('./files'), [
      applyTemplates({
        ...templateServeOptions,
        ...templateTestOptions
      }),
      move('/.vscode')
    ]);

    return chain([
      branchAndMerge(chain([
        mergeWith(templateSource)
      ])),
    ]);
  };
}

function getServeOptions(host: Tree) {
  const workspace = getWorkspace(host);
  const workspaceProject = getProjectFromWorkspace(workspace);

  return getProjectTargetOptions(workspaceProject, 'serve');
}

function getProjectTargetOptions(project: WorkspaceProject, buildTarget: string) {
  if (project.targets &&
      project.targets[buildTarget] &&
      project.targets[buildTarget].options) {

      return project.targets[buildTarget].options;
  }

  // TODO(devversion): consider removing this architect check if the CLI completely switched
  // over to `targets`, and the `architect` support has been removed.
  // See: https://github.com/angular/angular-cli/commit/307160806cb48c95ecb8982854f452303801ac9f
  if (project.architect &&
      project.architect[buildTarget] &&
      project.architect[buildTarget].options) {

      return project.architect[buildTarget].options;
  }

  throw new SchematicsException(
      `Cannot determine project target configuration for: ${buildTarget}.`);
}
