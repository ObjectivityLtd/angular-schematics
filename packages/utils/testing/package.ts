import { Tree } from "@angular-devkit/schematics";
import { getFileContent } from "./file";

export function packageDependency(tree: Tree, packageName: string) {
    const packageJson = JSON.parse(getFileContent(tree, '/package.json'));
    const dependencies = packageJson.dependencies;
    return dependencies && dependencies[packageName];
}

export function packageDevDependency(tree: Tree, packageName: string) {
    const packageJson = JSON.parse(getFileContent(tree, '/package.json'));
    const dependencies = packageJson.devDependencies;
    return dependencies && dependencies[packageName];
}

