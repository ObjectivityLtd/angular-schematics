import { Tree } from '@angular-devkit/schematics';

export function getFileContent(tree: Tree, filePath: string): string {
    const contentBuffer = tree.read(filePath);
  
    if (!contentBuffer) {
      throw new Error(`Cannot read "${filePath}" because it does not exist.`);
    }
  
    return contentBuffer.toString();
}

export function getFileContentAsLineCollection(tree: Tree, filePath: string): string[] {
    return getFileContent(tree, filePath).split(/\r\n|\n|\r/);
}

export function createFile(tree: Tree, path: string, lines: string[]) {
    tree.create(path, lines.join("\r\n"));
}
