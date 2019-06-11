# Angular schematic Azure Application Insights

Adds Azure AppInsights integration to Angular project.

Schematic adds external [@markpieszak/ng-application-insights](https://www.npmjs.com/package/@markpieszak/ng-application-insights) package.

## Overview

```bash
ng add @objectivity/angular-schematic-app-insights
```

Adds configuration of CI to the default Angular application.

it is possible to specify project name to use

```bash
ng add @objectivity/angular-schematic-app-insights [project name]
```

## Options

<details>
  <summary>instrumentation-key</summary>
  <p>
    <code>--instrumentation-key</code> (alias: <code>-k</code>) <em>default value: empty</em>
  </p>
  <p>
    Instrumentation key.
  </p>
</details>

<details>
  <summary>skip-install</summary>
  <p>
    <code>--skip-install</code> (alias: <code>-si</code>) <em>default value: false</em>
  </p>
  <p>
    Skip installing packages. (works only for minimalistic version of Bootstrap)
  </p>
</details>
