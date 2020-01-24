import { Tree } from "@angular-devkit/schematics/src/tree/interface";
import { SchematicContext, TaskId } from "@angular-devkit/schematics";
import { addPackageJsonDependency, NodeDependencyType } from 'schematics-utilities';
import { RunSchematicTask, NodePackageInstallTask } from "@angular-devkit/schematics/tasks";
import { green } from "@angular-devkit/core/src/terminal";

export class SchematicsRunner {
    private schematicTasksToRun: any[] = [];
    private runPostInstallTask = false;

    constructor(private tree: Tree, private context: SchematicContext) {
    }

    registerSchematic<T>(pkg: string, version: string, options: T) {
        addPackageJsonDependency(this.tree, { type: NodeDependencyType.Dev, version: version, name: pkg });
        this.schematicTasksToRun.push(new RunSchematicTask<T>(pkg, 'ng-add', options));

        if (options && (options as any).skipInstall != null) {
            this.runPostInstallTask = true;
        }
    }

    run() {

        if (this.schematicTasksToRun.length === 0) {
            return;
        }

        console.log('s', this.schematicTasksToRun.length);
        let installTaskIds = [this.context.addTask(new NodePackageInstallTask())];

        console.info(green(`Executing angular schematics...`));

        let executeTaskIds: TaskId[] = [];

        this.schematicTasksToRun.reverse();

        for (const schematicTaskToRun of this.schematicTasksToRun) {
            executeTaskIds.push(this.context.addTask(schematicTaskToRun, installTaskIds));
        }

        if (this.runPostInstallTask) {
            this.context.addTask(new NodePackageInstallTask(), executeTaskIds);
        }
    }
}