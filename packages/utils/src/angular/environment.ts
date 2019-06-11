import { Rule, SchematicContext, chain, SchematicsException } from "@angular-devkit/schematics";
import { Tree } from "@angular-devkit/schematics/src/tree/interface";
import { getWorkspace, getProjectFromWorkspace, readIntoSourceFile, getSourceNodes } from "schematics-utilities";
import { ts } from "./version-agnostic-typescript";
import { WorkspaceProject } from "@angular-devkit/core/src/experimental/workspace";
import { getProjectTargetConfigurations } from "./project-targets";

export function updateEnvironmentConfiguration(project: string, insertion: string): Rule {
    return (tree: Tree, _context: SchematicContext) => {
      const workspace = getWorkspace(tree);
      const workspaceProject = getProjectFromWorkspace(workspace, project);
      const envDirPath = getProjectEnvironmentPath(workspaceProject);
  
      const envDir = tree.getDir(envDirPath);
      const rules = envDir.subfiles.map(envPath => updateEnvironment(`${envDir.path}/${envPath}`, insertion));
  
      return chain(rules);
    };
  }
    
  export function getProjectEnvironmentPath(workspaceProject: WorkspaceProject): string {
    const envFilePath = getProjectEnvironmentFile(workspaceProject);
    return envFilePath.substr(0, envFilePath.lastIndexOf("/"))
  }
  
  function updateEnvironment(envPath: string, insertion: string): Rule {
    return (tree: Tree, _context: SchematicContext) => {
    
      const sourceFile = readIntoSourceFile(tree, envPath);
  
      // verify insertion does not already exist
      const sourceFileText = sourceFile.getText();
      if (sourceFileText.includes(insertion)) {
        return;
      }
  
      // get the array of top-level Node objects in the AST from the SourceFile
      const nodes = getSourceNodes(sourceFile as any);
      const start = nodes.find(
        node => node.kind === ts.SyntaxKind.OpenBraceToken
      )!;
      const end = nodes.find(
        node => node.kind === ts.SyntaxKind.CloseBraceToken,
        start.end
      )!;
  
      const recorder = tree.beginUpdate(envPath);
      recorder.insertLeft(end.pos, insertion);
      tree.commitUpdate(recorder);
  
      return tree;
    };
  }

  function getProjectEnvironmentFile(project: WorkspaceProject): string {
    const configurations = getProjectTargetConfigurations(project, 'build');
  
    if (
      !configurations.production ||
      !configurations.production.fileReplacements ||
      configurations.production.fileReplacements.length === 0
    ) {
      throw new SchematicsException(
        `Could not find the configuration of the workspace config (${
        project.sourceRoot
        })`
      );
    }
  
    const fileReplacements: [{ replace: string; with: string }] =
      configurations.production.fileReplacements;
    const fileReplacement = fileReplacements.find(replacement =>
      /environment\.ts$/.test(replacement.replace)
    );
  
    if (fileReplacement === undefined) {
      throw new SchematicsException(
        `Could not find the environment file replacement configuration of the workspace config (${
        project.sourceRoot
        })`
      );
    }
  
    return fileReplacement.replace;
  }