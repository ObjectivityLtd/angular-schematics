import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { RunSchematicTask } from '@angular-devkit/schematics/tasks';
import { Schema } from './schema';

export default function (options: Schema): Rule {
  return (_tree: Tree, context: SchematicContext) => {

    context.addTask(new RunSchematicTask('ts-import-path', options));
    context.addTask(new RunSchematicTask('scss-import', options));
    context.addTask(new RunSchematicTask('structure', options));
  };
}
