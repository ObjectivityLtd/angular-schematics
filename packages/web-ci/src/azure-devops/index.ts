import { Rule, SchematicContext, Tree, chain, apply, url, applyTemplates, move, mergeWith } from '@angular-devkit/schematics';
import { Schema } from './schema';

export function azureDevOps(options: Schema): Rule {
    return (_tree: Tree, _context: SchematicContext) => {
        return chain([
            createVstsCiBuildYamlFile(options)
        ]);
    };
}

function createVstsCiBuildYamlFile(options: Schema) {
    const templateSource = apply(url('./files'), [
        applyTemplates({
            ...options
        }),
        move('.')
    ]);
    return chain([
        mergeWith(templateSource)
    ]);
}
