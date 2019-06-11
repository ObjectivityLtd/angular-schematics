import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { RunSchematicTask } from '@angular-devkit/schematics/tasks';

import { Schema } from './schema';
export default function (options: Schema): Rule {
  return (_tree: Tree, context: SchematicContext) => {

    if (options.material) {
      context.addTask(new RunSchematicTask('material', { project: options.project }));
    }

    if (options.bootstrapMini) {
      context.addTask(new RunSchematicTask('bootstrap-mini', options));
    }
  };
}
