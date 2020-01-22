import { Tree, Rule, forEach } from '@angular-devkit/schematics';

// Custom implementation of MergeStrategy.Override 
// https://github.com/angular/angular-cli/issues/11337
export function overwriteIfExists(host: Tree): Rule {
    return forEach(fileEntry => {
        if (host.exists(fileEntry.path)) {
            host.overwrite(fileEntry.path, fileEntry.content);
            return null;
        }
        return fileEntry;
    });
}