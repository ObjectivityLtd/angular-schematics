import { Rule, SchematicContext, Tree, chain, apply, url, applyTemplates, move, mergeWith } from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { Schema } from './schema';
import { overwriteIfExists } from '@objectivity/angular-schematic-utils';

export function azureDevOps(options: Schema): Rule {
    return (tree: Tree, _context: SchematicContext) => {
        return chain([
            createVstsCiBuildYamlFile(tree, options)
        ]);
    };
}

function createVstsCiBuildYamlFile(tree: Tree, options: Schema) {
    const templateSource = apply(url('./files'), [
        applyTemplates({
            ...strings,
            ...options,
        }),
        move('.'),
        overwriteIfExists(tree)
    ]);
    return chain([
        mergeWith(templateSource)
    ]);
}
