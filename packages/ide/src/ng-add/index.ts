import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { RunSchematicTask } from '@angular-devkit/schematics/tasks';
import { Schema } from './schema';

export default function (options: Schema): Rule {
  return (_tree: Tree, context: SchematicContext) => {
    
    if (options.vscode) {
      context.addTask(new RunSchematicTask('vscode', { }));
    }
  };
}
