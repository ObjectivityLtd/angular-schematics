import { Rule, SchematicContext, Tree, chain, SchematicsException, apply, url, applyTemplates, move, mergeWith } from '@angular-devkit/schematics';
import { Schema } from './schema';
import { karmaJunitReporterPkg } from "../dependences";
import { normalize } from '@angular-devkit/core';
import { NodePackageInstallTask } from "@angular-devkit/schematics/tasks";
import { getWorkspace, getProjectFromWorkspace, WorkspaceProject, InsertChange, ReplaceChange, NoopChange, Change, NodeDependencyType, addPackageJsonDependency } from "schematics-utilities";
import { KarmaConfigurationContext } from './karma-configuration-context';
import * as ts from 'typescript';
import { overwriteIfExists } from '@objectivity/angular-schematic-utils';

export function karma(options: Schema): Rule {
    return (tree: Tree, _context: SchematicContext) => {
        const karmaConfigurationContext = createKarmaConfigurationContext(tree, options);

        return chain([
            updateKarmaConfiguration(karmaConfigurationContext, options),
            addJUnitFolderToIgnore(options),
            installPackages(options),
            createProtractorCiFile(tree, karmaConfigurationContext, options)
        ]);
    };
}

function addJUnitFolderToIgnore(_options: Schema): Rule {
    return (host: Tree, context: SchematicContext) => {
        context.logger.info(`Updating .gitignore configuration`);
        const gitignorePath = '.gitignore';

        try {
            const buffer = host.read(gitignorePath);
            if (buffer !== null) {
                let content = buffer.toString();
                content = content.concat('\n', '# Unit tests results.', '\n', '/junit', '\n');
                host.overwrite(gitignorePath, content);
            }
        } catch { }

        return host;
    };
}

function installPackages(_options: Schema): Rule {
    return (host: Tree, context: SchematicContext) => {
        addPackageJsonDependency(host, { type: NodeDependencyType.Default, version: karmaJunitReporterPkg.version, name: karmaJunitReporterPkg.pkg });

        if (_options.skipInstall !== true) {
            context.addTask(new NodePackageInstallTask());
        }

        return host;
    };
}

function createProtractorCiFile(tree: Tree, karmaConfigurationContext: KarmaConfigurationContext, options: Schema) {
    const templateSource = apply(url('./files'), [
        applyTemplates({
            ...options
        }),
        move(karmaConfigurationContext.protractorConfigPath),
        overwriteIfExists(tree)
    ]);
    return chain([
        mergeWith(templateSource)
    ]);
}

function updateKarmaConfiguration(karmaConfigurationContext: KarmaConfigurationContext, options: Schema): Rule {
    return (host: Tree, context: SchematicContext) => {
        context.logger.info(`Updating karma configuration`);

        let changes = [
            addPlugin(host, karmaConfigurationContext, 'karma-junit-reporter'),
            addReport(host, karmaConfigurationContext, 'cobertura'),
            addReporter(host, karmaConfigurationContext, 'junit'),
            addJunitReporter(host, karmaConfigurationContext, options),
            addLauncher(host, karmaConfigurationContext)
        ];
        
        const declarationRecorder = host.beginUpdate(karmaConfigurationContext.karmaConfigFileName);
        for (let change of changes) {
            if (change instanceof InsertChange) {
                declarationRecorder.insertLeft(change.pos, change.toAdd);
            } else if (change instanceof ReplaceChange) {
                const action = <any>change;
                declarationRecorder.remove(action.pos, action.oldText.length);
                declarationRecorder.insertLeft(action.pos, action.newText);
            }
        }
        host.commitUpdate(declarationRecorder);
    
        return host;
    };
}

function createKarmaConfigurationContext(host: Tree, options: Schema): KarmaConfigurationContext {
    const workspace = getWorkspace(host);
    const projectName = options.project;
    const workspaceProject = getProjectFromWorkspace(workspace, projectName);
    const karmaPath = getProjectKarmaFile(workspaceProject);
    const protractorPath = getProjectProtractorPath(workspaceProject);

    return {
        karmaConfigFileName: karmaPath,
        protractorConfigPath: protractorPath
    }
}

function getProjectKarmaFile(project: WorkspaceProject): string {
    const testOptions = getProjectTargetOptions(project, 'test');

    return normalize(testOptions.karmaConfig);
}

function getProjectProtractorPath(project: WorkspaceProject): string {
    const testOptions = getProjectTargetOptions(project, 'e2e');

    const protractorConfigFile = normalize(testOptions.protractorConfig);
    return protractorConfigFile.substring(0, protractorConfigFile.lastIndexOf("/"));
}

function getProjectTargetOptions(project: WorkspaceProject, buildTarget: string) {
    if (project.targets &&
        project.targets[buildTarget] &&
        project.targets[buildTarget].options) {

        return project.targets[buildTarget].options;
    }

    // TODO(devversion): consider removing this architect check if the CLI completely switched
    // over to `targets`, and the `architect` support has been removed.
    // See: https://github.com/angular/angular-cli/commit/307160806cb48c95ecb8982854f452303801ac9f
    if (project.architect &&
        project.architect[buildTarget] &&
        project.architect[buildTarget].options) {

        return project.architect[buildTarget].options;
    }

    throw new SchematicsException(
        `Cannot determine project target configuration for: ${buildTarget}.`);
}

export function addPlugin(host: Tree, karmaConfigurationContext: KarmaConfigurationContext, pluginName: string): Change {
    const properties = getProperties(host, karmaConfigurationContext);
    const pluginProperty = properties.find(property => getPropertyAssignmentByName(property, 'plugins'));
    
    if (pluginProperty != null) {

        const plugins = (pluginProperty.getChildren().find(n => n.kind === ts.SyntaxKind.ArrayLiteralExpression) as ts.ArrayLiteralExpression).elements;
        const chromePlugin = plugins.find(e => hasPlugin(e as ts.CallExpression, pluginName));

        if (chromePlugin == null) {
            let toAdd = `
      require('${pluginName}')`;
            let pos = plugins.pos;

            if (plugins.length > 0) {
                pos = plugins[plugins.length - 1].pos;
                toAdd = toAdd + ',';
            }  

            return new InsertChange(karmaConfigurationContext.karmaConfigFileName, pos, toAdd);
        }
    }

    return new NoopChange();
}

export function addReport(host: Tree, karmaConfigurationContext: KarmaConfigurationContext, reportName: string): Change {

    const properties = getProperties(host, karmaConfigurationContext);
    const coverageIstanbulReporterProperty = properties.find(property => getPropertyAssignmentByName(property, 'coverageIstanbulReporter'));

if (coverageIstanbulReporterProperty != null) {
    const coverageIstanbulReporterProperties = findNodes(coverageIstanbulReporterProperty, ts.SyntaxKind.PropertyAssignment);
    const reportProperty = coverageIstanbulReporterProperties.find(property => getPropertyAssignmentByName(property, 'reports'));

    if (reportProperty != null) {
        const reports = (reportProperty.getChildren().find(n => n.kind === ts.SyntaxKind.ArrayLiteralExpression) as ts.ArrayLiteralExpression).elements;
        const chromePlugin = reports.find(x => (x as ts.StringLiteral).text == reportName);

        if (chromePlugin == null) {
            let toAdd = `'${reportName}'`;
            let pos = reports.pos;

            if (reports.length > 0) {
                pos = reports[0].pos;
                toAdd = toAdd + ',';
            }

            return new InsertChange(karmaConfigurationContext.karmaConfigFileName, pos, toAdd);
        }
    }
}

return new NoopChange();
}

export function addLauncher(host: Tree, karmaConfigurationContext: KarmaConfigurationContext): Change {

    const properties = getProperties(host, karmaConfigurationContext);
    const customLaunchersProperty = properties.find(property => getPropertyAssignmentByName(property, 'customLaunchers'));

    const chromeHeadlessCI = `ChromeHeadlessCI: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }`;

    if (customLaunchersProperty == null) {
    const toAdd = `
    customLaunchers: {
      ${chromeHeadlessCI}
    },`;
    
        return new InsertChange(karmaConfigurationContext.karmaConfigFileName, properties[properties.length - 1].pos, toAdd);
    } else {
        const customLaunchersProperties = findNodes(customLaunchersProperty, ts.SyntaxKind.PropertyAssignment, 2);
        const chromeHeadlessCIProperty = customLaunchersProperties.find(property => getPropertyAssignmentByName(property, 'ChromeHeadlessCI'));

        if (chromeHeadlessCIProperty == null) {
        let toAdd = `
      ${chromeHeadlessCI}`;

            let pos = customLaunchersProperty.end;
            if (customLaunchersProperties.length > 1) {
                pos = customLaunchersProperties[customLaunchersProperties.length - 1].pos;
                toAdd = toAdd + ',';
            } else {
                pos = (findNodes(customLaunchersProperty, ts.SyntaxKind.ObjectLiteralExpression, 1)[0]).getStart() + 1; 
            }

            return new InsertChange(karmaConfigurationContext.karmaConfigFileName, pos, toAdd);
        } else {
            return new ReplaceChange(karmaConfigurationContext.karmaConfigFileName, chromeHeadlessCIProperty.getStart(), chromeHeadlessCIProperty.getText(), chromeHeadlessCI);
        }
    }
}

export function addReporter(host: Tree, karmaConfigurationContext: KarmaConfigurationContext, reporterName: string): Change {

    const properties = getProperties(host, karmaConfigurationContext);
    const reporterProperty = properties.find(property => getPropertyAssignmentByName(property, 'reporters'));

if (reporterProperty != null) {

    const reports = (reporterProperty.getChildren().find(n => n.kind === ts.SyntaxKind.ArrayLiteralExpression) as ts.ArrayLiteralExpression).elements;
    const chromePlugin = reports.find(x => (x as ts.StringLiteral).text == reporterName);

    if (chromePlugin == null) {
        let toAdd = `'${reporterName}'`;
        let pos = reports.pos;

        if (reports.length > 0) {
            pos = reports[0].pos;
            toAdd = toAdd + ',';
        }

        return new InsertChange(karmaConfigurationContext.karmaConfigFileName, pos, toAdd);
    }
}

return new NoopChange();
}

export function addJunitReporter(host: Tree, karmaConfigurationContext: KarmaConfigurationContext, options: Schema): Change {

    const properties = getProperties(host, karmaConfigurationContext);
    const reporterProperty = properties.find(property => getPropertyAssignmentByName(property, 'junitReporter'));

    const junitReporterConfiguration = `junitReporter: { outputDir: '${getJunitReporterOutputDir(host, options)}' }`;

    if (reporterProperty == null) {
        const toAdd = `
    ${junitReporterConfiguration},`;
        return new InsertChange(karmaConfigurationContext.karmaConfigFileName, properties[0].pos, toAdd);
    } else {
        return new ReplaceChange(karmaConfigurationContext.karmaConfigFileName, reporterProperty.getStart(), reporterProperty.getText(), junitReporterConfiguration);
    }
}

function getJunitReporterOutputDir(host: Tree, options: Schema) {
    const workspace = getWorkspace(host);
    const projectName = options.project;
    const project = getProjectFromWorkspace(workspace, projectName);  

    let pathDepth = project.root === '' ? '.' :  project.root.split('/').map(_ => '..').join('/');
    return pathDepth + '/junit';
}

function getPropertyAssignmentByName(node: ts.Node, propertyName: string) {
    const identifier = node.getChildren().find(n => n.kind === ts.SyntaxKind.Identifier) as ts.Identifier;
    return identifier != null && identifier.escapedText == propertyName;
}

function hasPlugin(node: ts.CallExpression, pluginName: string) {
    return node.arguments.findIndex(x => (x as ts.StringLiteral).text == pluginName) != -1;
}

function getProperties(host: Tree, karmaConfigurationContext: KarmaConfigurationContext) {
    const tsCfgJsonContent = host.read(karmaConfigurationContext.karmaConfigFileName);
    if (!tsCfgJsonContent) {
        throw new Error('Invalid path: ' + karmaConfigurationContext.karmaConfigFileName);
    }

    let sourceFile = ts.createSourceFile(karmaConfigurationContext.karmaConfigFileName, tsCfgJsonContent.toString('utf-8'), ts.ScriptTarget.Latest, true);
    return findNodes(sourceFile, ts.SyntaxKind.PropertyAssignment);
}

/**
 * Find all nodes from the AST in the subtree of node of SyntaxKind kind.
 * @param node
 * @param kind
 * @param max The maximum number of items to return.
 * @return all nodes of kind, or [] if none is found
 */
export function findNodes(node: ts.Node, kind: ts.SyntaxKind, max = Infinity): ts.Node[] {
    if (!node || max == 0) {
      return [];
    }
  
    const arr: ts.Node[] = [];
    if (node.kind === kind) {
      arr.push(node);
      max--;
    }
    if (max > 0) {
      for (const child of node.getChildren()) {
        findNodes(child, kind, max).forEach(node => {
          if (max > 0) {
            arr.push(node);
          }
          max--;
        });
  
        if (max <= 0) {
          break;
        }
      }
    }
  
    return arr;
  }