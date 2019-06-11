import { Rule, SchematicContext, Tree, chain, SchematicsException } from '@angular-devkit/schematics';
import { Schema } from './schema';
import { normalize, Path, parseJsonAst, JsonAstObject } from '@angular-devkit/core';
import { findPropertyInAstObject, appendPropertyInAstObject, appendValueInAstArray, getWorkspace, getProjectFromWorkspace, buildDefaultPath } from 'schematics-utilities';
import { trimSlashes } from '@objectivity/angular-schematic-utils';

export function scssImport(options: Schema): Rule {
    return (_tree: Tree, _context: SchematicContext) => {
        return chain([
            updateAngularFile(options)
        ]);
    };
}

function updateAngularFile(options: Schema): Rule {
    return (tree: Tree, _context: SchematicContext) => {
        const angularConfig = getConfigPath(tree);
        const workspace = getWorkspace(tree);
        const projectName = options.project;
        const workspaceProject = getProjectFromWorkspace(workspace, projectName);
        let projectPath = trimSlashes(buildDefaultPath(workspaceProject));
        const pathToScssFolder = `${projectPath}/scss`;

        const stylePreprocessorOptions = {
            includePaths: [
                pathToScssFolder
            ]
        };

        const angularConfigContent = tree.read(angularConfig);
        if (!angularConfigContent) {
            throw new Error('Invalid path: ' + angularConfig);
        }

        const tsCfgAst = parseJsonAst(angularConfigContent.toString('utf-8'));
        if (tsCfgAst.kind !== 'object') {
            throw new Error('Invalid tsconfig content.');
        }

        const buildOptionsAstNode = findPropertyInDeepAstObject(tsCfgAst, ['projects', options.project, 'architect', 'build', 'options']);
        const stylePreprocessorOptionsAstNode = findPropertyInAstObject(buildOptionsAstNode, 'stylePreprocessorOptions');

        if (!stylePreprocessorOptionsAstNode) {
            const recorder = tree.beginUpdate(angularConfig);
            appendPropertyInAstObject(recorder, buildOptionsAstNode, "stylePreprocessorOptions", stylePreprocessorOptions, 4);
            tree.commitUpdate(recorder);

        } else {

            if (stylePreprocessorOptionsAstNode.kind !== 'object') {
                throw new Error('Invalid stylePreprocessorOptionsAstNode content.');
            }

            const includePathsAstNode = findPropertyInAstObject(stylePreprocessorOptionsAstNode, 'includePaths');

            
            if (!includePathsAstNode) {
                const recorder = tree.beginUpdate(angularConfig);
                appendPropertyInAstObject(recorder, stylePreprocessorOptionsAstNode, 'includePaths', stylePreprocessorOptions.includePaths, 4);
                tree.commitUpdate(recorder);
            } else {

                if (includePathsAstNode && includePathsAstNode.kind != 'array') {
                    throw new SchematicsException('Invalid includePaths property; expected an array.');
                }

                if (!includePathsAstNode.value.includes(pathToScssFolder)) {
                    const recorder = tree.beginUpdate(angularConfig);
                    appendValueInAstArray(recorder, includePathsAstNode, pathToScssFolder);
                    tree.commitUpdate(recorder);
                }
            }
        }
    };
}

function findPropertyInDeepAstObject(node: JsonAstObject, propertyNames: string[]): JsonAstObject {
    propertyNames.forEach((property: string) => {
        const astNode = findPropertyInAstObject(node, property);
        if (!astNode || astNode.kind !== 'object') {
            throw new Error(`Invalid ${property} content.`);
        }

        node = astNode;
    });

    return node;
}
/*
function updateAngularFile(options: Schema): Rule {
    return (tree: Tree, _context: SchematicContext) => {
        const angularConfig = getConfigPath(tree);
        const rules: Rule[] = [];

        const angularConfigContent = tree.read(angularConfig);
        if (!angularConfigContent) {
            throw new Error('Invalid path: ' + angularConfig);
        }

        const angularJson = parseJson(angularConfigContent.toString(), JsonParseMode.Loose);

        if (!isJsonObject(angularJson) || !isJsonObject(angularJson.projects)) {
            // If that field isn't there, no use...
            return;
        }

        const project = angularJson.projects[options.project];

        if (!isJsonObject(project)) {
            return;
        }

        const targets = project.targets || project.architect;
        if (!isJsonObject(targets)) {
            return;
        }

        const target = targets['build'];
        if (isJsonObject(target)) {
          rules.push(_updateProjectTarget(target));
        }

        return chain(rules);
    };
}

function isJsonObject(value: JsonValue): value is JsonObject {
    return value != null && typeof value === 'object' && !Array.isArray(value);
  }
*/
function getConfigPath(tree: Tree): Path {

    const possiblePath = normalize('angular.json');
    if (tree.exists(possiblePath)) {
        return possiblePath;
    }

    throw new SchematicsException('Could not find configuration file');
}
/*
function _updateProjectTarget(targetObject: JsonObject): Rule {
    // Make sure we're using the correct builder.
    if (targetObject.builder !== '@angular-devkit/build-angular:browser'
        || !isJsonObject(targetObject.options)) {
      return noop();
    }
    const options = targetObject.options;
    if (!isJsonObject(targetObject.options.stylePreprocessorOptions)) {
        // Add to configuration
      return noop();
    }

    //const stylePreprocessorOptionsToUpdate = options.stylePreprocessorOptions;

    return noop();

    //const configurations = targetObject.configurations;
    // if (isJsonObject(configurations)) {
    //   for (const configName of Object.keys(configurations)) {
    //     const config = configurations[configName];

    //     // Just in case, only do non-AOT configurations.
    //     if (isJsonObject(config)
    //         && typeof config.polyfills == 'string'
    //         && config.aot !== true) {
    //       polyfillsToUpdate.push(config.polyfills);
    //     }
    //   }
    // }

    // return chain(
    //   polyfillsToUpdate.map(polyfillPath => {
    //     return (tree: Tree) => _removeReflectFromPolyfills(tree, polyfillPath);
    //   }),
    // );
  }
*/