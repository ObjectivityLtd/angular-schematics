import { Rule, SchematicContext, Tree, chain, apply, url, move, mergeWith, SchematicsException } from '@angular-devkit/schematics';
import { Schema } from './schema';
import { getWorkspace, getProjectFromWorkspace, WorkspaceProject, NodeDependencyType, addPackageJsonDependency } from 'schematics-utilities';
import { bootstrapPkg } from '../dependences';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { red, italic } from '@angular-devkit/core/src/terminal';
import { buildRootPath } from '@objectivity/angular-schematic-utils';
import { normalize } from '@angular-devkit/core';

export function bootstrapMini(options: Schema): Rule {
    return (tree: Tree, context: SchematicContext) => {

        const workspace = getWorkspace(tree);
        const projectName = options.project;
        const workspaceProject = getProjectFromWorkspace(workspace, projectName);

        addPackageJsonDependency(tree, { type: NodeDependencyType.Default, version: bootstrapPkg.version, name: bootstrapPkg.pkg });

        if (options.skipInstall !== true) {
            context.addTask(new NodePackageInstallTask());
        }

        return chain([
            addSccsFiles(workspaceProject),
            updateAppStyle(workspaceProject)
        ]);
    };
}

function addSccsFiles(workspaceProject: WorkspaceProject) {

    return (_host: Tree) => {
        const projectPath = buildRootPath(workspaceProject);

        const templateSource = apply(url('./files'), [
            move(projectPath)
        ]);

        return mergeWith(templateSource);
    };
}

function updateAppStyle(workspaceProject: WorkspaceProject) {
    return (host: Tree) => {
        const styleFilePath = getStylesPath(workspaceProject);

        if (!styleFilePath) {
            console.warn(red(`Could not find the default style file for this project.`));
            return;
        }

        const buffer = host.read(styleFilePath);

        if (!buffer) {
            console.warn(red(`Could not read the default style file within the project (${italic(styleFilePath)})`));
            return;
        }

        const htmlContent = buffer.toString();
        const insertion = '\n' +
            `@import 'scss/bootstrap.scss';\n`;

        if (htmlContent.includes(insertion)) {
            return;
        }

        const recorder = host.beginUpdate(styleFilePath);

        recorder.insertLeft(htmlContent.length, insertion);
        host.commitUpdate(recorder);
    };
}

export function getStylesPath(project: WorkspaceProject): string {
    const targets = (<any>project).targets || project.architect;
    const buildTarget = targets['build'];
  
    if (buildTarget.options && buildTarget.options.styles && buildTarget.options.styles.length) {
      const styles = buildTarget.options.styles.map((s: { input: any; }) => (typeof s === 'string' ? s : s.input));
  
      // First, see if any of the assets is called "styles.(le|sc|c)ss", which is the default
      // "main" style sheet.
      const defaultMainStylePath = styles.find((a: string) => /styles\.(c|le|sc)ss/.test(a));
      if (defaultMainStylePath) {
        return normalize(defaultMainStylePath);
      }
  
      // If there was no obvious default file, use the first style asset.
      const fallbackStylePath = styles.find((a: string) => /\.(c|le|sc)ss/.test(a));
      if (fallbackStylePath) {
        return normalize(fallbackStylePath);
      }
    }
  
    throw new SchematicsException('No style files could be found into which a theme could be added');
  }

