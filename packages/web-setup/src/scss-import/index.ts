import { Rule } from '@angular-devkit/schematics';
import { Builders } from 'schematics-utilities';
import { Schema } from './schema';
import { updateWorkspace } from './workspace';

export function scssImport(_options: Schema): Rule {
    return updateWorkspace(workspace => {
        const project = workspace.projects.get(_options.project);
        if (project) {
            for (const [, target] of project.targets) {
                if (target.builder === Builders.Browser || target.builder === Builders.Karma) {

                    target.options = {
                        ...(target.options || {}),
                        ...{
                            "stylePreprocessorOptions": {
                                "includePaths": [
                                    "src/app/scss"
                                ]
                            }
                      }
                    };
                }
            }         
        }
    });
}