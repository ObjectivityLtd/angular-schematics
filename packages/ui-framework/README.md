# Angular Schematic UI Framework

Adds configuration of UI framework.

## Overview

```bash
ng add @objectivity/angular-schematic-ui-framework
```

Adds configuration of CI to the default Angular application.

it is possible to specify project name to use

```bash
ng add @objectivity/angular-schematic-ui-framework [project name]
```

## Options

<details>
  <summary>material</summary>
  <p>
    <code>--material</code> (alias: <code>-m</code>) <em>default value: true</em>
  </p>
  <p>
    When true, adds Angular Material to the application without affecting any templates.
  </p>
</details>

<details>
  <summary>bootstrapMini</summary>
  <p>
    <code>--bootstrapMini</code> (alias: <code>-bm</code>) <em>default value: true</em>
  </p>
  <p>
    When true, adds minimalistic version of Bootstrap.
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
