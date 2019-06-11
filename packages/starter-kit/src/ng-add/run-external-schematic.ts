import { Rule, SchematicContext, Tree, chain, externalSchematic, noop } from '@angular-devkit/schematics';
import { Schema } from './schema';

export function runExternalSchematic(options: Schema): Rule {
  return (_tree: Tree, _context: SchematicContext) => {
    return chain([
      options.uiFramework ? externalSchematic('@objectivity/angular-schematic-ui-framework', 'ng-add', { project: options.project }) : noop(),
      options.ci ? externalSchematic('@objectivity/angular-schematic-web-ci', 'ng-add', { project: options.project, skipInstall: true }) : noop(),
      options.ide ? externalSchematic('@objectivity/angular-schematic-ide', 'ng-add', { }) : noop(),
      options.appInsights ? externalSchematic('@objectivity/angular-schematic-app-insights', 'ng-add', { }) : noop(),
      options.setup ? externalSchematic('@objectivity/angular-schematic-web-setup', 'ng-add', { }) : noop()
    ]);
  };
}
