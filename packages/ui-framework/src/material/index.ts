import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { Schema } from './schema';
import { addPackageToPackageJson } from 'schematics-utilities';
import { materialVersion } from '../version-names';
import { NodePackageInstallTask, RunSchematicTask } from '@angular-devkit/schematics/tasks';

export function material(options: Schema): Rule {
    return (tree: Tree, context: SchematicContext) => {
        const materialOptions = {
            ...options,
            gestures: true,
            animations: true
        }

        addPackageToPackageJson(tree, 'dependencies', '@angular/material', `${materialVersion}`);

        // Since the schematic depend on the Angular Material schematic, 
        // we need to install the Angular Material before executing the schematic.
        const installTaskId = context.addTask(new NodePackageInstallTask());

        context.addTask(new RunSchematicTask('@angular/material','ng-add', materialOptions), [installTaskId]);
    };
}