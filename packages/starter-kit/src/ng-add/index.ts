import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { Schema } from './schema';
import { SchematicsRunner } from './schematics-runner';

export default function (options: Schema): Rule {
  return (tree: Tree, context: SchematicContext) => {

    const version = '^0.1.0-alpha';
    const runner = new SchematicsRunner(tree, context);
    if (options.setup) {
      runner.registerSchematic('@objectivity/angular-schematic-web-setup', version, {});
    }
    if (options.uiFramework) {
      runner.registerSchematic('@objectivity/angular-schematic-ui-framework', version, { project: options.project, skipInstall: true });
    }
    if (options.ci) {
      runner.registerSchematic('@objectivity/angular-schematic-web-ci', version, { project: options.project, skipInstall: true });
    }
    if (options.ide) {
      runner.registerSchematic('@objectivity/angular-schematic-ide', version, {});
    }
    if (options.appInsights) {
      runner.registerSchematic('@objectivity/angular-schematic-app-insights', version, { project: options.project, skipInstall: true });
    }
    runner.run();
  };
}