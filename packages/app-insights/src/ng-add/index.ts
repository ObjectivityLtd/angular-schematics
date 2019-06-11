import { Rule, SchematicContext, Tree, chain, branchAndMerge, SchematicsException } from '@angular-devkit/schematics';
import { Schema } from './schema';
import { updateEnvironmentConfiguration, getCoreModulePath, getAppModulePath } from '@objectivity/angular-schematic-utils';
import { addPackageToPackageJson, getWorkspace, getProjectFromWorkspace, addImportToModule, InsertChange, getSourceFile, addSymbolToNgModuleMetadata } from 'schematics-utilities';
import { ngApplicationInsightsVersion } from '../version-names';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { RunSchematicTask } from '@angular-devkit/schematics/tasks';

export default function (options: Schema): Rule {
  return (_tree: Tree, context: SchematicContext) => {

    context.addTask(new RunSchematicTask('monitoring-module', options));

    return chain([
      branchAndMerge(
        chain([
          addExternaPackage(options),
          updateEnvironments(options),
          updateCoreModule(options)
        ])),
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

    updateEnvironmentConfiguration(options.project, insertion);
  };
}

function updateCoreModule(options: Schema): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const workspace = getWorkspace(tree);
    const workspaceProject = getProjectFromWorkspace(workspace, options.project);
    const coreModulePath = getCoreModulePath(tree, workspaceProject);

    const coreModuleExists = !!coreModulePath;
    const mainModulePath = coreModulePath || getAppModulePath(tree, workspaceProject);

    const moduleSource = getSourceFile(tree, mainModulePath);

    if (!moduleSource) {
      throw new SchematicsException(`Module not found: ${coreModulePath}`);
    }

    const recorder = tree.beginUpdate(mainModulePath);

    let changes = [
      ...addImportToModule(moduleSource, mainModulePath, 'MonitoringModule', `./${coreModuleExists ? '' : 'core/'}monitoring`)
    ];

    if(coreModuleExists) {
      changes.concat(addSymbolToNgModuleMetadata(moduleSource, mainModulePath, 'exports', 'MonitoringModule'));
    }
  
    changes.forEach(change => {
      if (change instanceof InsertChange) {
        recorder.insertLeft(change.pos, change.toAdd);
      }
    });

    tree.commitUpdate(recorder);

    return tree;
  };
}

function addExternaPackage(options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    addPackageToPackageJson(tree, 'dependencies', '@markpieszak/ng-application-insights', `${ngApplicationInsightsVersion}`);

    if (options.skipInstall !== true) {
      context.addTask(new NodePackageInstallTask());
    }
  };
}