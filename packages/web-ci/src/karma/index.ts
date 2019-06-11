import { Rule, SchematicContext, Tree, chain, SchematicsException } from '@angular-devkit/schematics';
import { Schema } from './schema';
import { karmaJunitReporterVersion } from "../version-names";
import { normalize } from '@angular-devkit/core';
import { NodePackageInstallTask } from "@angular-devkit/schematics/tasks";
import { addPackageToPackageJson, getWorkspace, getProjectFromWorkspace, WorkspaceProject } from "schematics-utilities";

export function karma(options: Schema): Rule {
    return (_tree: Tree, _context: SchematicContext) => {
        return chain([
            updateKarmaConfiguration(options),
            addJUnitFolderToIgnore(options),
            installPackages(options)
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
        addPackageToPackageJson(host, 'dependencies', 'karma-junit-reporter', karmaJunitReporterVersion);

        if (_options.skipInstall !== true) {
            context.addTask(new NodePackageInstallTask());
        }

        return host;
    };
}

function updateKarmaConfiguration(options: Schema): Rule {
    return (host: Tree, context: SchematicContext) => {
        context.logger.info(`Updating karma configuration`);

        const workspace = getWorkspace(host);
        const projectName = options.project;
        const workspaceProject = getProjectFromWorkspace(workspace, projectName);
        const karmaPath = getProjectKarmaFile(workspaceProject);

        try {
            const buffer = host.read(karmaPath);
            if (buffer !== null) {
                let content = buffer.toString();
                content = content.replace(/plugins: \[(\n\s+)/gm, 'plugins: \[$1require(\'karma-junit-reporter\'),$1');
                content = content.replace(/(reports: \[)/gm, `$1'cobertura', `);
                content = content.replace(/(reporters: \[)/gm, `$1'junit', `);
                content = content.replace(/(\n\s+)(port:)/gm, `$1junitReporter: { outputDir: './junit' },$1$2`);
                host.overwrite(karmaPath, content);
            }
        } catch { }

        return host;
    };
}

function getProjectKarmaFile(project: WorkspaceProject): string {
    const testOptions = getProjectTargetOptions(project, 'test');

    return normalize(testOptions.karmaConfig);
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