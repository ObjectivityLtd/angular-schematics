import { Rule, SchematicContext, Tree, chain, branchAndMerge } from '@angular-devkit/schematics';
import { Schema } from './schema';
import { updateEnvironmentConfiguration, coreModuleExists, addModuleToCoreModule } from '@objectivity/angular-schematic-utils';
import { getWorkspace, getProjectFromWorkspace, WorkspaceProject, addModuleImportToRootModule } from 'schematics-utilities';
import { ngApplicationInsights } from '../dependences';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { RunSchematicTask } from '@angular-devkit/schematics/tasks';
import { addPackageJsonDependency, NodeDependencyType } from 'schematics-utilities';

export default function (options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {

    const workspace = getWorkspace(tree);
    const workspaceProject = getProjectFromWorkspace(workspace, options.project);
    const skipCoreModule = coreModuleExists(tree, workspaceProject);

    context.addTask(new RunSchematicTask('monitoring-module', { ...options, skipCoreModule }));

    return chain([
      branchAndMerge(
        chain([
          addExternaPackage(options),
          updateEnvironments(options),
          skipCoreModule ? addMonitorModuleToCoreModule(workspaceProject) : addMonitorModuleToRootModule(workspaceProject)
        ]))
    ]);
  };
}

function updateEnvironments(options: Schema): Rule {
  return (_tree: Tree, _context: SchematicContext) => {
    const insertion =
      ',\n' +
      `  appInsights: {\n` +
      `    instrumentationKey: '${options.instrumentationKey}'\n` +
      `  }`;

    return updateEnvironmentConfiguration(options.project, insertion);
  };
}

function addMonitorModuleToCoreModule(workspaceProject: WorkspaceProject): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    addModuleToCoreModule(tree, 'MonitoringModule', `./monitoring`, workspaceProject);
    return tree;
  };
}

function addMonitorModuleToRootModule(workspaceProject: WorkspaceProject): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    addModuleImportToRootModule(tree, 'CoreModule', `./core/core.module`, workspaceProject)
    return tree;
  };
}

function addExternaPackage(options: Schema): Rule {
    return (tree: Tree, context: SchematicContext) => {
        addPackageJsonDependency(tree, { type: NodeDependencyType.Default, version: ngApplicationInsights.version, name: ngApplicationInsights.pkg });

    if (options.skipInstall !== true) {
      context.addTask(new NodePackageInstallTask());
    }
  };
}