import { Rule, SchematicContext, Tree, TaskId } from '@angular-devkit/schematics';
import { Schema } from './schema';
import { RunSchematicTask, NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { green } from '@angular-devkit/core/src/terminal';
import { addPackageToPackageJson } from "schematics-utilities";

export default function (options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {
    
    let runInstallTask = false;
    let runPostInstallTask = false;

    if (options.uiFramework) {
      addPackageToPackageJson(tree, 'devDependencies', '@objectivity/angular-schematic-ui-framework', '^0.0.0');
      runInstallTask = true;
    }

    if (options.ci) {
      addPackageToPackageJson(tree, 'devDependencies', '@objectivity/angular-schematic-web-ci', '^0.0.0');
      runInstallTask = true;
      runPostInstallTask = true;
    }

    if (options.ide) {
      addPackageToPackageJson(tree, 'devDependencies', '@objectivity/angular-schematic-ide', '^0.0.0');
      runInstallTask = true;
    }

    if (options.setup) {
      addPackageToPackageJson(tree, 'devDependencies', '@objectivity/angular-schematic-web-setup', '^0.0.0');
      runInstallTask = true;
    }

    if (options.appInsights) {
      addPackageToPackageJson(tree, 'devDependencies', '@objectivity/angular-schematic-app-insights', '^0.0.0');
      runInstallTask = true;
    }

    let installTaskIds: TaskId[] | undefined = undefined; 

    // Since the Starter Kit schematics depend on the schematic utility functions from the
    // different angular-schematic packages, we need to install packages before loading the schematic files.
    if (runInstallTask) {
      const installTaskId = context.addTask(new NodePackageInstallTask());
      installTaskIds = [installTaskId];
    }
    
    console.info(green(`Executing angular schematics...`));

    const executeTaskId  = context.addTask(new RunSchematicTask('ng-add-external-schematic', options), installTaskIds);

    if(runPostInstallTask) {
      context.addTask(new NodePackageInstallTask(), [executeTaskId]);
    }
  };
}