import { HostTree } from '@angular-devkit/schematics';
import { UnitTestTree } from '@angular-devkit/schematics/testing';
import { importAndExportModule } from '.';
import { createFile, getFileContentAsLineCollection } from '../../testing';

describe(`angular utils`, () => {

    it(`importAndExportModule should update file module`, async () => {
        const appTree = new UnitTestTree(new HostTree());
        const path = 'core.module.ts';
        createFile(appTree, path,
            [`import { NgModule } from '@angular/core';`,
                `import { CommonModule } from '@angular/common';`,
                ``,
                `@NgModule({`,
                `  declarations: [],`,
                `  imports: [`,
                `    CommonModule`,
                `  ],`,
                `  exports: []`,
                `})`,
                `export class CoreModule { }`,
                ``]);


        importAndExportModule(appTree, 'MonitoringModule', `./monitoring`, path);

        const content = getFileContentAsLineCollection(appTree, path);
        expect(content).toEqual(
            [`import { NgModule } from '@angular/core';`,
                `import { CommonModule } from '@angular/common';`,
                `import { MonitoringModule } from './monitoring';`,
                ``,
                `@NgModule({`,
                `  declarations: [],`,
                `  imports: [`,
                `    CommonModule,`,
                `    MonitoringModule`,
                `  ],`,
                `  exports: [MonitoringModule]`,
                `})`,
                `export class CoreModule { }`,
                ``]);
    });
});
