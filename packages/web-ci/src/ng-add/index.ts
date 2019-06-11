import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { RunSchematicTask } from '@angular-devkit/schematics/tasks';
import { Schema } from './schema';

export default function (options: Schema): Rule {
  return (_tree: Tree, context: SchematicContext) => {

    context.addTask(new RunSchematicTask('karma', { project: options.project, skipInstall: options.skipInstall }));
    
    if (options.azureDevops) {
      context.addTask(new RunSchematicTask('azure-devops', { project: options.project }));
    }
  };
}
