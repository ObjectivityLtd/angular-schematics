import { Rule, SchematicContext, Tree, chain, apply, url, applyTemplates, move, mergeWith } from '@angular-devkit/schematics';
import { Schema } from './schema';
import { jasmineReportersPkg, karmaJunitReporterPkg, puppeteerPkg } from "../dependences";
import { normalize } from '@angular-devkit/core';
import { NodePackageInstallTask } from "@angular-devkit/schematics/tasks";
import { getWorkspace, WorkspaceProject, NodeDependencyType, addPackageJsonDependency } from "schematics-utilities";
import { KarmaConfigurationContext } from './karma-configuration-context';
import { getProjectTargetOptions, JSONFile, overwriteIfExists } from '@objectivity/angular-schematic-utils';
import { getProjectFromWorkspace } from '@objectivity/angular-schematic-utils';

export function karma(options: Schema): Rule {
    return (tree: Tree, _context: SchematicContext) => {
        const karmaConfigurationContext = createKarmaConfigurationContext(tree, options);

        return chain([
            createKarmaCiFile(tree, karmaConfigurationContext, options),
            addJUnitFolderToIgnore(options),
            updatePackageScripts(options),
            installPackages(options),
            createProtractorCiFile(tree, karmaConfigurationContext, options)
        ]);
    };
}

function updatePackageScripts(_options: Schema): Rule {
    return (tree: Tree, _context: SchematicContext) => {

        const json = new JSONFile(tree, 'package.json');
        const existingScripts = json.get(['scripts']) as object;
        const updatedScripts = {
            ...existingScripts,
            ...{
                "install-puppeteer": "cd node_modules/puppeteer && npm run install",
                "build:ci": "ng build --prod --aot -vc -cc --buildOptimizer",
                "e2e:ci": "npm run install-puppeteer && ng e2e --protractor-config=e2e/protractor-ci.conf.js",
                "test:ci": "ng test --karma-config=karma-ci.conf.js --code-coverage --no-progress --source-map=false"
            }
        }
        json.modify(['scripts'], updatedScripts);
    }
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
        addPackageJsonDependency(host, { type: NodeDependencyType.Dev, version: karmaJunitReporterPkg.version, name: karmaJunitReporterPkg.pkg });
        addPackageJsonDependency(host, { type: NodeDependencyType.Dev, version: puppeteerPkg.version, name: puppeteerPkg.pkg });
        addPackageJsonDependency(host, { type: NodeDependencyType.Dev, version: jasmineReportersPkg.version, name: jasmineReportersPkg.pkg });

        if (_options.skipInstall !== true) {
            context.addTask(new NodePackageInstallTask());
        }

        return host;
    };
}

function createProtractorCiFile(tree: Tree, karmaConfigurationContext: KarmaConfigurationContext, options: Schema) {
    const templateSource = apply(url('./files/e2e'), [
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

function createKarmaCiFile(tree: Tree, karmaConfigurationContext: KarmaConfigurationContext, options: Schema) {
    const templateSource = apply(url('./files/src'), [
        applyTemplates({
            ...options,
            ...{
                junitReporterOutputDir: karmaConfigurationContext.rootPath + '/junit',
                coverageReporterOutputDir: karmaConfigurationContext.rootPath + '/coverage/' + options.project
            }
        }),
        move(karmaConfigurationContext.karmaConfigPath),
        overwriteIfExists(tree)
    ]);
    return chain([
        mergeWith(templateSource)
    ]);
}

function createKarmaConfigurationContext(host: Tree, options: Schema): KarmaConfigurationContext {
    const workspace = getWorkspace(host);
    const projectName = options.project;
    const workspaceProject = getProjectFromWorkspace(workspace, projectName);
    const karmaPath = getProjectKarmaPath(workspaceProject);
    const protractorPath = getProjectProtractorPath(workspaceProject);

    return {
        karmaConfigPath: karmaPath,
        protractorConfigPath: protractorPath,
        rootPath: workspaceProject.root === '' ? '.' :  workspaceProject.root.split('/').map(_ => '..').join('/')
    }
}

function getProjectKarmaPath(project: WorkspaceProject): string {
    const testOptions = getProjectTargetOptions(project, 'test');

    const karmaConfigFile = normalize(testOptions.karmaConfig);
    return karmaConfigFile.substring(0, karmaConfigFile.lastIndexOf("/"));
}

function getProjectProtractorPath(project: WorkspaceProject): string {
    const testOptions = getProjectTargetOptions(project, 'e2e');

    const protractorConfigFile = normalize(testOptions.protractorConfig);
    return protractorConfigFile.substring(0, protractorConfigFile.lastIndexOf("/"));
}
