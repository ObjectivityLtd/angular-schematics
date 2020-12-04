import { TaskConfiguration } from "@angular-devkit/schematics";

export function getRunSchematic<T>(tasks: TaskConfiguration<{}>[], schematic: string) {
    const task = <TaskConfiguration<{ name: string, options: T }>>tasks.find((t: TaskConfiguration<{ name: string, options: T }>) => t.name === 'run-schematic' && t.options?.name === schematic);
   
    return task && {
        name: task.options?.name,
        dependencies: task.dependencies,
        options: task.options?.options
    };
}

export function getRunSchematicAndCollection<T>(tasks: TaskConfiguration<{}>[], collection: string, schematic: string) {
    const task = <TaskConfiguration<{ name: string, collection: string, options: T }>>tasks.find((t: TaskConfiguration<{ name: string, collection: string, options: T }>) => t.name === 'run-schematic' && t.options?.collection === collection && t.options?.name === schematic);
    return task && {
        name: task.options?.name,
        dependencies: task.dependencies,
        options: task.options?.options
    };
}
