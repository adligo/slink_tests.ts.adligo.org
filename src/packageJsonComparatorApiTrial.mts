/**
 * This file just contains tests for the PackageJsonComparator.
 *
 * Copyright 2025 Adligo Inc / Scott Morgan
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import { ApiTrial, AssertionContext, Test, TestParams, TrialSuite } from '../../tests4ts.ts.adligo.org/src/tests4ts.mjs';
import {
  CliCtx, CliCtxArg,
  FsContext,
  I_CliCtx,
  I_CliCtxFlag,
  I_Fs,
  I_FsContext,
  I_Proc,
  PackageJsonComparator,
  Path,
  Paths,
  SLinkRunner
} from '../../slink.ts.adligo.org/src/slink.mjs';
import { CliCtxMockParams, CliCtxMock, FsContextMockParams, FsContextMock, ProcMock } from "./etc/mocks/mocks.mjs";
import fs from "fs";

/**
 * The tests for the PackageJsonComparator
 */
export class PackageJsonComparatorApiTrial extends ApiTrial {
  public static testZeroDeps: Test = new Test(TestParams.of(
    'org.adligo.ts.slink_tests.PackageJsonComparatorApiTrial.' +
    'testZeroDeps'), (ac: AssertionContext) => {
    let projectJson = {};
    const projectRoot: Path = Paths.newPath('Z:/mock/current/project', false, true);
    const projectRootPackageJson: Path = Paths.newPath('Z:/mock/current/project/package.json', false, true);

    const sharedJsonPath: Path = Paths.newPath('Z:/mock/shared_deps_project/package.json', false, true);
    const cliCtxParams = new CliCtxMockParams();
    cliCtxParams._dir = projectRoot;
    cliCtxParams._debug = false;
    // Setup - single project, directory exists
    const ctxMock: CliCtxMock = new CliCtxMock(cliCtxParams);

    const fscParams = new FsContextMockParams();
    fscParams._ac = ac;
    fscParams._existsAbsResponses = [{_order: 1, _path: sharedJsonPath, _response: true },
    ];
    const sharedJson = '{}';
    fscParams._readJsonResponses = [{ _path: sharedJsonPath, _json: sharedJson }];
    const fscMock: FsContextMock = new FsContextMock(fscParams);

    let pac = new PackageJsonComparator(projectJson, ctxMock, fscMock, sharedJsonPath);

    ac.isFalse(pac.checkForMismatch(), "There should be no mismatches or missing dependencies.");
    ac.equals(0,ctxMock.getOutCalls(),"No calls to print through ctx.out should have been called.");
  });
  public static testTwoMissing: Test = new Test(TestParams.of(
    'org.adligo.ts.slink_tests.PackageJsonComparatorApiTrial.' +
    'testTwoMissing'), (ac: AssertionContext) => {
    let projectJson = { dependencies: { foo: 'bar'}, devDependencies: { xyz: '123'}};
    const projectRoot: Path = Paths.newPath('Z:/mock/current/project', false, true);
    const projectRootPackageJson: Path = Paths.newPath('Z:/mock/current/project/package.json', false, true);

    const sharedJsonPath: Path = Paths.newPath('Z:/mock/shared_deps_project/package.json', false, true);
    const cliCtxParams = new CliCtxMockParams();
    cliCtxParams._dir = projectRoot;
    cliCtxParams._debug = false;
    // Setup - single project, directory exists
    const ctxMock: CliCtxMock = new CliCtxMock(cliCtxParams);

    const fscParams = new FsContextMockParams();
    fscParams._ac = ac;
    fscParams._existsAbsResponses = [{_order: 1, _path: sharedJsonPath, _response: true },
    ];
    const sharedJson = '{}';
    fscParams._readJsonResponses = [{ _path: sharedJsonPath, _json: sharedJson }];
    const fscMock: FsContextMock = new FsContextMock(fscParams);

    let pac = new PackageJsonComparator(projectJson, ctxMock, fscMock, sharedJsonPath);

    ac.isTrue(pac.checkForMismatch(), "There should be missing dependencies.");
    ac.equals(1,ctxMock.getOutCalls(),"One call to print through ctx.out should have been called.");
    ac.equals(PackageJsonComparator.THE_FOLLOWING_PACKAGE_JSON_IS_MISSING_THE_SUBSEQUENT_DEPENDENCIES +
        sharedJsonPath.toPathString() + '\n\tfoo bar\n\txyz 123\n\t',
      ctxMock.getOutCall(0),"The error message for missing depencies should match.")
  });
  public static testTwoWrong: Test = new Test(TestParams.of(
    'org.adligo.ts.slink_tests.PackageJsonComparatorApiTrial.' +
    'testTwoWrong'), (ac: AssertionContext) => {
    let projectJson = { dependencies: { foo: 'bar'}, devDependencies: { xyz: '123'}};
    const projectRoot: Path = Paths.newPath('Z:/mock/current/project', false, true);
    const projectRootPackageJson: Path = Paths.newPath('Z:/mock/current/project/package.json', false, true);

    const sharedJsonPath: Path = Paths.newPath('Z:/mock/shared_deps_project/package.json', false, true);
    const cliCtxParams = new CliCtxMockParams();
    cliCtxParams._dir = projectRoot;
    cliCtxParams._debug = false;
    // Setup - single project, directory exists
    const ctxMock: CliCtxMock = new CliCtxMock(cliCtxParams);

    const fscParams = new FsContextMockParams();
    fscParams._ac = ac;
    fscParams._existsAbsResponses = [{_order: 1, _path: sharedJsonPath, _response: true },
    ];
    const sharedJson = '{ "dependencies": { "xyz": "1234"}, "devDependencies": {"foo": "barz"}}';
    fscParams._readJsonResponses = [{ _path: sharedJsonPath, _json: sharedJson }];
    const fscMock: FsContextMock = new FsContextMock(fscParams);

    let pac = new PackageJsonComparator(projectJson, ctxMock, fscMock, sharedJsonPath);

    ac.isTrue(pac.checkForMismatch(), "There should be missing dependencies.");
    ac.equals(1,ctxMock.getOutCalls(),"One call to print through ctx.out should have been called.");
    ac.equals(PackageJsonComparator.THE_FOLLOWING_PACKAGE_JSON_FILES_HAVE_MISMATCHED_VERSIONS +
        sharedJsonPath.toPathString() + '\n\t' + projectRootPackageJson.toPathString() + '\n\t' +
        'foo bar vs shared barz\n\txyz 123 vs shared 1234\n\t',
        ctxMock.getOutCall(0),"The error message for mismatched depencies should match.")
  });
  public static testTwoMissingAndThreeWrong: Test = new Test(TestParams.of(
    'org.adligo.ts.slink_tests.PackageJsonComparatorApiTrial.' +
    'testTwoMissingAndThreeWrong'), (ac: AssertionContext) => {
    let projectJson = { dependencies: { foo: 'bar', zstat: 'grr', json: '345'}, devDependencies: { xyz: '123', puff: 'z354'}};
    const projectRoot: Path = Paths.newPath('Z:/mock/current/project', false, true);
    const projectRootPackageJson: Path = Paths.newPath('Z:/mock/current/project/package.json', false, true);

    const sharedJsonPath: Path = Paths.newPath('Z:/mock/shared_deps_project/package.json', false, true);
    const cliCtxParams = new CliCtxMockParams();
    cliCtxParams._dir = projectRoot;
    cliCtxParams._debug = false;
    // Setup - single project, directory exists
    const ctxMock: CliCtxMock = new CliCtxMock(cliCtxParams);

    const fscParams = new FsContextMockParams();
    fscParams._ac = ac;
    fscParams._existsAbsResponses = [{_order: 1, _path: sharedJsonPath, _response: true },
    ];
    const sharedJson = '{ "dependencies": { "xyz": "1234"}, "devDependencies": {"foo": "barz"}}';
    fscParams._readJsonResponses = [{ _path: sharedJsonPath, _json: sharedJson }];
    const fscMock: FsContextMock = new FsContextMock(fscParams);

    let pac = new PackageJsonComparator(projectJson, ctxMock, fscMock, sharedJsonPath);

    ac.isTrue(pac.checkForMismatch(), "There should be missing dependencies.");
    ac.equals(2,ctxMock.getOutCalls(),"One call to print through ctx.out should have been called.");
    ac.equals(PackageJsonComparator.THE_FOLLOWING_PACKAGE_JSON_IS_MISSING_THE_SUBSEQUENT_DEPENDENCIES +
        sharedJsonPath.toPathString() + '\n\t' +
        'zstat grr\n\tjson 345\n\tpuff z354\n\t',
        ctxMock.getOutCall(0),"The error message for mismatched depencies should match.")
    ac.equals(PackageJsonComparator.THE_FOLLOWING_PACKAGE_JSON_FILES_HAVE_MISMATCHED_VERSIONS +
        sharedJsonPath.toPathString() + '\n\t' + projectRootPackageJson.toPathString() + '\n\t' +
        'foo bar vs shared barz\n\txyz 123 vs shared 1234\n\t',
        ctxMock.getOutCall(1),"The error message for mismatched depencies should match.")
  });
  public static testSwapMatch: Test = new Test(TestParams.of(
    'org.adligo.ts.slink_tests.PackageJsonComparatorApiTrial.' +
    'testSwapMatch'), (ac: AssertionContext) => {
    let projectJson = { dependencies: { foo: 'bar'}, devDependencies: { xyz: '123'}};
    const projectRoot: Path = Paths.newPath('Z:/mock/current/project', false, true);
    const projectRootPackageJson: Path = Paths.newPath('Z:/mock/current/project/package.json', false, true);

    const sharedJsonPath: Path = Paths.newPath('Z:/mock/shared_deps_project/package.json', false, true);
    const cliCtxParams = new CliCtxMockParams();
    cliCtxParams._dir = projectRoot;
    cliCtxParams._debug = false;
    // Setup - single project, directory exists
    const ctxMock: CliCtxMock = new CliCtxMock(cliCtxParams);

    const fscParams = new FsContextMockParams();
    fscParams._ac = ac;
    fscParams._existsAbsResponses = [{_order: 1, _path: sharedJsonPath, _response: true },
    ];
    const sharedJson = '{ "dependencies": { "xyz": "123"}, "devDependencies": {"foo": "bar"}}';
    fscParams._readJsonResponses = [{ _path: sharedJsonPath, _json: sharedJson }];
    const fscMock: FsContextMock = new FsContextMock(fscParams);

    let pac = new PackageJsonComparator(projectJson, ctxMock, fscMock, sharedJsonPath);

    ac.isFalse(pac.checkForMismatch(), "There should be missing dependencies.");
    ac.equals(0,ctxMock.getOutCalls(),"Zero calls to print through ctx.out should have been called.");
  });
  constructor() {
    super('PackageJsonComparatorApiTrial', [
      PackageJsonComparatorApiTrial.testZeroDeps,
      PackageJsonComparatorApiTrial.testTwoMissing,
      PackageJsonComparatorApiTrial.testTwoWrong,
      PackageJsonComparatorApiTrial.testTwoMissingAndThreeWrong,
      PackageJsonComparatorApiTrial.testSwapMatch
    ]);
  }
}
