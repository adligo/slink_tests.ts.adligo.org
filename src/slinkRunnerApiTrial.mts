/**
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
  Path,
  Paths,
  SLinkRunner
} from '../../slink.ts.adligo.org/src/slink.mjs';
import { CliCtxMockParams, CliCtxMock, FsMock, I_ExistsAbsResponse, I_ExistsResponse, I_ReadJsonResponse, FsContextMockParams, FsContextMock, ProcMock } from "./etc/mocks/mocks.mjs";



/**
 * The tests for SLinkRunnerApiTrial.
 * Note each test is broken out into a static member with the strange lowerCase naming convention for
 * better outlines (Structure) in Eclipse and WebStorm respectively.
 */
export class SLinkRunnerApiTrial extends ApiTrial {
  public static testHandleSharedNodeModulesViaEnvVar: Test = new Test(TestParams.of(
    'org.adligo.ts.slink_tests.SLinkRunnerApiTrial.' +
    'testHandleSharedNodeModulesViaEnvVar').ignore(), (ac: AssertionContext) => {
    // Setup
    const mockCtx = new CliCtxMock(new CliCtxMockParams());
    const mockFsCtx = new FsContextMock(new FsContextMockParams());

    // Save original process.env
    const originalEnv = process.env;

    try {
      // Mock process.env
      process.env = { ...originalEnv, TEST_NODE_MODULE_SLINK: '/mock/node_modules/path' };

      // Setup mock package.json
      mockFsCtx.mockPackageJson = {
        sharedNodeModuleProjectSLinkEnvVar: ['TEST_NODE_MODULE_SLINK']
      };

      // Create SLinkRunner with mocks
      const runner = new SLinkRunner(mockCtx as any);
      (runner as any).fsCtx = mockFsCtx;

      // Run the method directly
      (runner as any).handleSharedNodeModulesViaEnvVar(['TEST_NODE_MODULE_SLINK']);

      // Verify
      ac.isTrue(mockFsCtx.getRmCalls() > 0, 'Should call rm to remove existing node_modules');
      ac.isTrue(mockFsCtx.getSlinkCalls() > 0, 'Should call slink to create symlink');

      const slinkCall = mockFsCtx.getSlinkCall(0);
      ac.same('node_modules', slinkCall._slinkName, 'Should create symlink named node_modules');
      ac.isTrue(slinkCall._toDir.toUnix().includes('/mock/node_modules/path'),
        'Should link to the path from environment variable');
    } finally {
      // Restore original process.env
      process.env = originalEnv;
    }
  });
  public static testHandleDependencySrcSLinks: Test = new Test(TestParams.of(
    'org.adligo.ts.slink_tests.SLinkRunnerApiTrial.' +
    'testHandleDependencySrcSLinks').ignore(), (ac: AssertionContext) => {
    // Setup
    const ctxParams = new CliCtxMockParams();
    const mockCtx = new CliCtxMock(ctxParams);
    const mockFsCtx = new FsContextMock(new FsContextMockParams());

    // Setup mock package.json
    mockFsCtx.mockPackageJson = {
      dependencySrcSLinks: [{
        project: 'test-project'
      }]
    };

    // Create SLinkRunner with mocks
    const runner = new SLinkRunner(mockCtx as any);
    (runner as any).fsCtx = mockFsCtx;

    // Run the method directly
    (runner as any).handleDependencySrcSLinks([{
      project: 'test-project'
    }]);

    // Verify
    ac.isTrue(mockFsCtx.getRmCalls() > 0, 'Should call rm to remove existing symlink');
    ac.isTrue(mockFsCtx.getSlinkCalls() > 0, 'Should call slink to create symlink');

    const slinkCall = mockFsCtx.getSlinkCall(0);
    ac.same('test-project@slink', slinkCall._slinkName, 'Should create symlink with correct name');

  });
  public static testHandleDependencySLinkGroups: Test = new Test(TestParams.of(
    'org.adligo.ts.slink_tests.SLinkRunnerApiTrial.' +
    'testHandleDependencySLinkGroups'), (ac: AssertionContext) => {

    const projectRoot: Path = Paths.newPath('Z:/omock/current/project', false, true);
    const projectRootNotWindows: Path = Paths.newPath('Z:/omock/current/project', false, false);
    const projectRootPackageJson: Path = Paths.newPath('Z:/omock/current/project/package.json', false, true);
    const cliCtxParams = new CliCtxMockParams();
    cliCtxParams._dir = projectRoot;
    cliCtxParams._windows = true;
    // Setup - single project, directory exists
    const mockCtx: CliCtxMock = new CliCtxMock(cliCtxParams);
    const fscParams = new FsContextMockParams();
    fscParams._ac = ac;
    /*
    const omockSharedDeps = Paths.newPath('Z:/omock/shared_deps_foo', false, true);
    const omockSharedDepsNodeModules = Paths.newPath('Z:/omock/shared_deps_foo/node_modules', false, true);
    */
    const projectNodeModules: Path = Paths.newPath('node_modules', true, true);
    fscParams._existsAbsResponses = [{_order: 1, _path: projectRoot, _response: true },
      {_order: 2, _path: projectRoot.child('package.json'), _response: true }
    ];
    fscParams._existsResponses = [{_order: 1, _fileOrDir: 'node_modules', _inDir: projectRoot, _response: false }];
    const packageJson = `
 { "dependencySLinkGroups": [{ 
    "group": "@test", "projects": [{
      "project": "test-project",
      "modulePath": "test" }]
    }
]}`;
    fscParams._readJsonResponses = [{ _path: projectRootPackageJson, _json: packageJson }];
    const mockFsc: FsContextMock = new FsContextMock(fscParams);


    // Create SLinkRunner with mocks
    const runner = new SLinkRunner(mockCtx, mockFsc);
    runner.run();

    // Verify 6 assertions, another 10+ assertions are done in the FsContextMock
    ac.equals(1, mockCtx.getDoneCalls(), "CliCtx.isDone() should be called once");
    ac.equals(1, mockCtx.getSetDirCalls(), "CliCtx.setDir() should be called once");
    ac.equals(1, mockFsc.getSlinkCalls(), "There should be one call to create symbolic link");
    //slink(slinkName: string, toDir: Path, inDir: Path): void;
    let slinkCall0 = mockFsc.getSlinkCall(0);
    ac.equals("test", slinkCall0._slinkName, "The symbolic link name should match");
    const expectedRelativePath = Paths.newPath('../../../test-project/src', true, false);
    ac.equals(expectedRelativePath.toString(), slinkCall0._toDir.toString(),
        "The symbolic link should point to the test project src directory.");
    ac.equals(projectRootNotWindows.child('node_modules').child('@test').toString(), slinkCall0._inDir.toString(),
        "The symbolic link be created in the project's node_modules/@test directory.");
  });
  public static testFullRunWithSharedNodeModulesViaEnvVar: Test = new Test(TestParams.of(
    'org.adligo.ts.slink_tests.SLinkRunnerApiTrial.' +
    'testFullRunWithSharedNodeModulesViaEnvVar'), (ac: AssertionContext) => {

    const projectRoot: Path = Paths.newPath('Z:/mock/current/project', false, true);
    const projectRootPackageJson: Path = Paths.newPath('Z:/mock/current/project/package.json', false, true);
    const cliCtxParams = new CliCtxMockParams();
    cliCtxParams._dir = projectRoot;
    const procMock = new ProcMock();
    procMock._env = new Map<string,string>();
    procMock._env["TEST_NODE_MODULE_SLINK"] = "Z:/omock/shared_deps_foo/node_modules";
    cliCtxParams._proc = procMock;
    // Setup - single project, directory exists
    const mockCtx: CliCtxMock = new CliCtxMock(cliCtxParams);
    const fscParams = new FsContextMockParams();
    fscParams._ac = ac;
    const omockSharedDeps = Paths.newPath('Z:/omock/shared_deps_foo', false, true);
    const omockSharedDepsPackageJson = Paths.newPath('Z:/omock/shared_deps_foo/package.json', false, true);
    const omockSharedDepsNodeModules = Paths.newPath('Z:/omock/shared_deps_foo/node_modules', false, true);
    const projectNodeModules: Path = Paths.newPath('node_modules', true, true);
    fscParams._existsAbsResponses = [{_order: 1, _path: projectRoot, _response: true },
      {_order: 2, _path: projectRoot.child('package.json'), _response: true },
      {_order: 3, _path: omockSharedDepsNodeModules, _response: true },
      {_order: 4, _path: omockSharedDepsPackageJson, _response: true },
    ];
    fscParams._existsResponses = [{_order: 1, _fileOrDir: 'node_modules', _inDir: projectRoot, _response: false }];
    const packageJson = '{ "sharedNodeModuleProjectSLinkEnvVar": ["TEST_NODE_MODULE_SLINK"]}';
    const sharedPackageJson = '{}';
    fscParams._readJsonResponses = [{ _path: projectRootPackageJson, _json: packageJson }, { _path: omockSharedDepsPackageJson, _json: sharedPackageJson }];
    const mockFsc: FsContextMock = new FsContextMock(fscParams);


    // Create SLinkRunner with mocks
    const runner = new SLinkRunner(mockCtx, mockFsc);
    runner.run();

    // Verify 6 assertions, another 10+ assertions are done in the FsContextMock
    ac.equals(1, mockCtx.getDoneCalls(), "CliCtx.isDone() should be called once");
    ac.equals(1, mockCtx.getSetDirCalls(), "CliCtx.setDir() should be called once");
    ac.equals(1, mockFsc.getSlinkCalls(), "There should be one call to create symbolic link");
    //slink(slinkName: string, toDir: Path, inDir: Path): void;
    let slinkCall0 = mockFsc.getSlinkCall(0);
    ac.equals("node_modules", slinkCall0._slinkName, "The symbolic link name should match");
    ac.equals(omockSharedDepsNodeModules.toString(), slinkCall0._toDir.toString(),
        "The symbolic link should point to the shared deps projects node_modules directory.");
    ac.equals(projectRoot.toString(), slinkCall0._inDir.toString(),
        "The symbolic link should be created in the projectRoot dir. ");
  });

  public static testHandleSharedNodeModulesViaProjectLinkDirExists: Test =
    new Test(TestParams.of(
      'org.adligo.ts.slink_tests.SLinkRunnerApiTrial.' +
      'testHandleSharedNodeModulesViaProjectLinkDir'), (ac: AssertionContext) => {

      const projectRoot: Path = Paths.newPath('Z:/mock/current/project', false, true);
      const projectRootPackageJson: Path = Paths.newPath('Z:/mock/current/project/package.json', false, true);
      const cliCtxParams = new CliCtxMockParams();
      cliCtxParams._dir = projectRoot;
      // Setup - single project, directory exists
      const mockCtx: CliCtxMock = new CliCtxMock(cliCtxParams);


      const fscParams = new FsContextMockParams();
      fscParams._ac = ac;
      const sharedDepsProject: Path = Paths.newPath('Z:/mock/current/shared_deps_foo', false, true);
      const sharedDepsPackageJson: Path = Paths.newPath('Z:/mock/current/shared_deps_foo/package.json', false, true);
      const sharedDepsNodeModules: Path = Paths.newPath('Z:/mock/current/shared_deps_foo/node_modules', false, true);
      const projectNodeModules: Path = Paths.newPath('node_modules', true, true);
      fscParams._existsAbsResponses = [{_order: 1, _path: projectRoot, _response: true },
        {_order: 2, _path: projectRoot.child('package.json'), _response: true },
        {_order: 3, _path: sharedDepsProject, _response: true },
        {_order: 4, _path: sharedDepsNodeModules, _response: true },
        {_order: 5, _path: sharedDepsPackageJson, _response: true },
      ];
      fscParams._existsResponses = [{_order: 1, _fileOrDir: 'node_modules', _inDir: projectRoot, _response: false }];
      const packageJson = '{ "sharedNodeModuleProjectSLinks": ["shared_deps_foo"]}';
      const sharedPackageJson = '{}';
      fscParams._readJsonResponses = [{ _path: projectRootPackageJson, _json: packageJson }, { _path: sharedDepsPackageJson, _json: sharedPackageJson}];
      const mockFsc: FsContextMock = new FsContextMock(fscParams);


      // Create SLinkRunner with mocks
      const runner = new SLinkRunner(mockCtx, mockFsc);
      runner.run();

      // Verify 6 assertions, another 13 assertions are done in the FsContextMock
      ac.equals(1, mockCtx.getDoneCalls(), "CliCtx.isDone() should be called once");
      ac.equals(1, mockCtx.getSetDirCalls(), "CliCtx.setDir() should be called once");
      ac.equals(1, mockFsc.getSlinkCalls(), "There should be one call to create symbolic link");
      //slink(slinkName: string, toDir: Path, inDir: Path): void;
      let slinkCall0 = mockFsc.getSlinkCall(0);
      ac.equals("node_modules", slinkCall0._slinkName, "The symbolic link name should match");
      ac.equals(sharedDepsNodeModules.toString(), slinkCall0._toDir.toString(),
          "The symbolic link should point to the shared deps projects node_modules directory.");
      ac.equals(projectRoot.toString(), slinkCall0._inDir.toString(),
          "The symbolic link should be created in the projectRoot dir. ");
    });


  public static testHandleSharedNodeModulesViaProjectLinkDirMissing: Test = new Test(
    TestParams.of(
      'org.adligo.ts.slink_tests.SLinkRunnerApiTrial.' +
      'testHandleSharedNodeModulesViaProjectLinkDirMissing'), (ac: AssertionContext) => {

    const projectRoot: Path = Paths.newPath('Z:/mock/current/project', false, true);
    const projectRootPackageJson: Path = Paths.newPath('Z:/mock/current/project/package.json', false, true);
    const cliCtxParams = new CliCtxMockParams();
    cliCtxParams._dir = projectRoot;
    // Setup - single project, directory exists
    const mockCtx: CliCtxMock = new CliCtxMock(cliCtxParams);


    const fscParams = new FsContextMockParams();
    fscParams._ac = ac;
    const sharedDepsProjectPath: Path = Paths.newPath('Z:/mock/current/shared_deps_foo', false, true);
    const projectNodeModules: Path = Paths.newPath('node_modules', true, true);
    fscParams._existsAbsResponses = [{_order: 1, _path: projectRoot, _response: true },
      {_order: 2, _path: projectRoot.child('package.json'), _response: true },
      {_order: 3, _path: sharedDepsProjectPath, _response: false },
      {_order: 4, _path: Paths.newPath('Z:/mock/shared_deps_foo', false, true), _response: false},
      {_order: 5, _path: Paths.newPath('Z:/shared_deps_foo', false, true), _response: false},
    ];
    fscParams._existsResponses = [{_order: 1, _fileOrDir: 'node_modules', _inDir: projectRoot, _response: false }];
    const packageJson = '{ "sharedNodeModuleProjectSLinks": ["shared_deps_foo"]}';
    fscParams._readJsonResponses = [{ _path: projectRootPackageJson, _json: packageJson }];
    const mockFsc: FsContextMock = new FsContextMock(fscParams);


    // Create SLinkRunner with mocks
    const runner = new SLinkRunner(mockCtx, mockFsc);
    runner.run();

    // Verify 3 assertions, another 11 assertions are done in the FsContextMock
    ac.equals(1, mockCtx.getDoneCalls(), "CliCtx.isDone() should be called once");
    ac.equals(1, mockCtx.getSetDirCalls(), "CliCtx.setDir() should be called once");
    ac.equals(0, mockFsc.getSlinkCalls(), "There should be one call to create symbolic link");
  });


  public static testHandleSharedNodeModulesViaProjectLinkMultiDirFirstExists: Test = new Test(TestParams.of(
      'org.adligo.ts.slink_tests.SLinkRunnerApiTrial.' +
      'testHandleSharedNodeModulesViaProjectLinkMultiDirFirstExists'), (ac: AssertionContext) => {

    const projectRoot: Path = Paths.newPath('Z:/mock/current/project', false, true);
    const projectRootPackageJson: Path = Paths.newPath('Z:/mock/current/project/package.json', false, true);
    const cliCtxParams = new CliCtxMockParams();
    cliCtxParams._dir = projectRoot;
    // Setup - single project, directory exists
    const mockCtx: CliCtxMock = new CliCtxMock(cliCtxParams);


    const fscParams = new FsContextMockParams();
    fscParams._ac = ac;
    const shareDeps = Paths.newPath('Z:/mock/current/shared_deps_foo3', false, true);
    const shareDepsNodeModules = Paths.newPath('Z:/mock/current/shared_deps_foo3/node_modules', false, true);
    const shareDepsPackageJson = Paths.newPath('Z:/mock/current/shared_deps_foo3/package.json', false, true);
    const projectNodeModules: Path = Paths.newPath('node_modules', true, true);
    fscParams._existsAbsResponses = [{_order: 1, _path: projectRoot, _response: true },
      {_order: 2, _path: projectRoot.child('package.json'), _response: true },
      {_order: 3, _path: shareDeps, _response: true },
      {_order: 4, _path: shareDepsNodeModules, _response: true },
      {_order: 5, _path: shareDepsPackageJson, _response: true }
    ];
    fscParams._existsResponses = [{_order: 1, _fileOrDir: 'node_modules', _inDir: projectRoot, _response: false }];
    const packageJson = '{ "sharedNodeModuleProjectSLinks": ["shared_deps_foo3","other_shared_deps"]}';
    const sharedPackageJson = '{}';
    fscParams._readJsonResponses = [{ _path: projectRootPackageJson, _json: packageJson }, { _path: shareDepsPackageJson, _json: sharedPackageJson}];
    const mockFsc: FsContextMock = new FsContextMock(fscParams);


    // Create SLinkRunner with mocks
    const runner = new SLinkRunner(mockCtx, mockFsc);
    runner.run();

    // Verify 3 assertions, another 10+ assertions are done in the FsContextMock
    ac.equals(1, mockCtx.getDoneCalls(), "CliCtx.isDone() should be called once");
    ac.equals(1, mockCtx.getSetDirCalls(), "CliCtx.setDir() should be called once");
    ac.equals(1, mockFsc.getSlinkCalls(), "There should be one call to create symbolic link");
    let slinkCall0 = mockFsc.getSlinkCall(0);
    ac.equals("node_modules", slinkCall0._slinkName, "The symbolic link name should match");
    ac.equals(shareDepsNodeModules.toString(), slinkCall0._toDir.toString(),
        "The symbolic link should point to the shared deps projects node_modules directory.");
    ac.equals(projectRoot.toString(), slinkCall0._inDir.toString(),
        "The symbolic link should be created in the projectRoot dir. ");
  });


  public static testHandleSharedNodeModulesViaProjectLinkMultiDir2ndExists: Test = new Test(TestParams.of(
    'org.adligo.ts.slink_tests.SLinkRunnerApiTrial.' +
    'testHandleSharedNodeModulesViaProjectLinkMultiDir2ndExists'), (ac: AssertionContext) => {

    const projectRoot: Path = Paths.newPath('Z:/mock/current/project', false, true);
    const projectRootPackageJson: Path = Paths.newPath('Z:/mock/current/project/package.json', false, true);
    const cliCtxParams = new CliCtxMockParams();
    cliCtxParams._dir = projectRoot;
    // Setup - single project, directory exists
    const mockCtx: CliCtxMock = new CliCtxMock(cliCtxParams);


    const fscParams = new FsContextMockParams();
    fscParams._ac = ac;
    const otherShareDeps = Paths.newPath('Z:/mock/current/other_shared_deps', false, true);
    const otherShareDepsNodeModules = Paths.newPath('Z:/mock/current/other_shared_deps/node_modules', false, true);
    const otherShareDepsPackageJson = Paths.newPath('Z:/mock/current/other_shared_deps/package.json', false, true);
    const projectNodeModules: Path = Paths.newPath('node_modules', true, true);
    fscParams._existsAbsResponses = [{_order: 1, _path: projectRoot, _response: true },
      {_order: 2, _path: projectRoot.child('package.json'), _response: true },
      {_order: 3, _path: Paths.newPath('Z:/mock/current/shared_deps_foo', false, true), _response: false },
      {_order: 4, _path: otherShareDeps, _response: true },
      {_order: 5, _path: otherShareDepsNodeModules, _response: true },
      {_order: 6, _path: otherShareDepsPackageJson, _response: true },
    ];
    fscParams._existsResponses = [{_order: 0, _fileOrDir: 'node_modules', _inDir: projectRoot, _response: false }];
    const packageJson = '{ "sharedNodeModuleProjectSLinks": ["shared_deps_foo","other_shared_deps"]}';
    const sharedPackageJson = '{}';
    fscParams._readJsonResponses = [{ _path: projectRootPackageJson, _json: packageJson }, { _path: otherShareDepsPackageJson, _json: sharedPackageJson }];
    const mockFsc: FsContextMock = new FsContextMock(fscParams);


    // Create SLinkRunner with mocks
    const runner = new SLinkRunner(mockCtx, mockFsc);
    runner.run();

    // Verify 3 assertions, another 10+ assertions are done in the FsContextMock
    ac.equals(1, mockCtx.getDoneCalls(), "CliCtx.isDone() should be called once");
    ac.equals(1, mockCtx.getSetDirCalls(), "CliCtx.setDir() should be called once");
    ac.equals(1, mockFsc.getSlinkCalls(), "There should be one call to create symbolic link");
    let slinkCall0 = mockFsc.getSlinkCall(0);
    ac.equals("node_modules", slinkCall0._slinkName, "The symbolic link name should match");
    ac.equals(otherShareDepsNodeModules.toString(), slinkCall0._toDir.toString(),
        "The symbolic link should point to the shared deps projects node_modules directory.");
    ac.equals(projectRoot.toString(), slinkCall0._inDir.toString(),
        "The symbolic link should be created in the projectRoot dir. ");
  });


  public static testHandleSharedNodeModulesViaProjectLinkMultiDirMissing: Test = new Test(TestParams.of(
    'org.adligo.ts.slink_tests.SLinkRunnerApiTrial.' +
    'testHandleSharedNodeModulesViaProjectLinkMultiDirMissing'), (ac: AssertionContext) => {

    const projectRoot: Path = Paths.newPath('Z:/mock/current/project', false, true);
    const projectRootPackageJson: Path = Paths.newPath('Z:/mock/current/project/package.json', false, true);
    const cliCtxParams = new CliCtxMockParams();
    cliCtxParams._dir = projectRoot;
    // Setup - single project, directory exists
    const mockCtx: CliCtxMock = new CliCtxMock(cliCtxParams);


    const fscParams = new FsContextMockParams();
    fscParams._ac = ac;
    const projectNodeModules: Path = Paths.newPath('node_modules', true, true);
    fscParams._existsAbsResponses = [{_order: 1, _path: projectRoot, _response: true },
      {_order: 2, _path: projectRoot.child('package.json'), _response: true },
      {_order: 3, _path: Paths.newPath('Z:/mock/current/shared_deps_foo', false, true), _response: false },
      {_order: 4, _path: Paths.newPath('Z:/mock/current/other_shared_deps', false, true), _response: false },
      {_order: 5, _path: Paths.newPath('Z:/mock/shared_deps_foo', false, true), _response: false },
      {_order: 6, _path: Paths.newPath('Z:/mock/other_shared_deps', false, true), _response: false },
      {_order: 7, _path: Paths.newPath('Z:/shared_deps_foo', false, true), _response: false },
      {_order: 8, _path: Paths.newPath('Z:/other_shared_deps', false, true), _response: false },
    ];
    fscParams._existsResponses = [{_order: 1, _fileOrDir: 'node_modules', _inDir: projectRoot, _response: false }];
    const packageJson = '{ "sharedNodeModuleProjectSLinks": ["shared_deps_foo","other_shared_deps"]}';
    fscParams._readJsonResponses = [{ _path: projectRootPackageJson, _json: packageJson }];
    const mockFsc: FsContextMock = new FsContextMock(fscParams);


    // Create SLinkRunner with mocks
    const runner = new SLinkRunner(mockCtx, mockFsc);
    runner.run();

        // TODO actually assert stuff here
        /*
        ac.equals(1, mockCtx.doneCalls, "CliCtx.isDone() should be called once");
        ac.equals(1, mockCtx.setDirCalls, "CliCtx.setDir() should be called once");
        ac.equals(0, mockFsc.slinkCalls.length, "There should be one call to create symbolic link");

         */
      });

      public static testPublishLocalSuccess: Test = new Test(TestParams.of(
        'org.adligo.ts.slink_tests.SLinkRunnerApiTrial.' +
        'testPublishLocalSuccess'), (ac: AssertionContext) => {
        // Setup
        const projectRoot: Path = Paths.newPath('Z:/mock/current/project', false, true);
        const projectRootPackageJson: Path = Paths.newPath('Z:/mock/current/project/package.json', false, true);
        const nodeModulesPath: Path = Paths.newPath('Z:/mock/current/project/node_modules', false, true);
        const symlinkTarget: Path = Paths.newPath('Z:/mock/shared/node_modules', false, true);
        const targetPackageDir: Path = Paths.newPath('Z:/mock/shared/node_modules/@ts.adligo.org/slink', false, true);
        const binFilePath: Path = Paths.newPath('Z:/mock/current/project/dist/slink.mjs', false, true);

        const cliCtxParams = new CliCtxMockParams();
        cliCtxParams._dir = projectRoot;
        cliCtxParams._windows = true;
        const mockCtx: CliCtxMock = new CliCtxMock(cliCtxParams);

        const fscParams = new FsContextMockParams();
        fscParams._ac = ac;
        fscParams._existsAbsResponses = [
          {_order: 1, _path: nodeModulesPath, _response: true },
          {_order: 2, _path: projectRootPackageJson, _response: true },
          {_order: 3, _path: targetPackageDir, _response: false }, // Package dir doesn't exist initially
          {_order: 4, _path: binFilePath, _response: true }
        ];

        const packageJson = JSON.stringify({
          name: '@ts.adligo.org/slink',
          version: '1.5.4',
          bin: {
            slink: './dist/slink.mjs'
          }
        });

        fscParams._readJsonResponses = [{ _path: projectRootPackageJson, _json: packageJson }];
        const mockFsc: FsContextMock = new FsContextMock(fscParams);

        // Mock isSymlink to return true
        mockFsc.isSymlink = (dir: Path): boolean => {
          if (dir.toString() === nodeModulesPath.toString()) {
            return true;
          }
          return false;
        };

        // Mock getSymlinkTarget to return the target path
        mockFsc.getSymlinkTarget = (dir: Path): Path => {
          if (dir.toString() === nodeModulesPath.toString()) {
            return symlinkTarget;
          }
          throw new Error('Unexpected symlink target request');
        };

        // Create SLinkRunner with mocks
        const runner = new SLinkRunner(mockCtx, mockFsc);
        runner.run();

        // TODO actually assert stuff here
        /*
        ac.equals(1, mockCtx.setDirCalls, "CliCtx.setDir() should be called once");
        ac.isTrue(mockFsc.mkDirCalls.length >= 2, "Should create package directory and dist directory");
        ac.isTrue(mockCtx.runCalls.length > 0, "Should execute commands to copy files");
        ac.isTrue(mockCtx.printCalls.length > 0, "Should print progress messages");

         */
  });

  public static testPublishLocalNoNodeModules: Test = new Test(TestParams.of(
    'org.adligo.ts.slink_tests.SLinkRunnerApiTrial.' +
    'testPublishLocalNoNodeModules'), (ac: AssertionContext) => {
    // Setup
    const projectRoot: Path = Paths.newPath('Z:/mock/current/project', false, true);
    const nodeModulesPath: Path = Paths.newPath('Z:/mock/current/project/node_modules', false, true);

    const cliCtxParams = new CliCtxMockParams();
    cliCtxParams._dir = projectRoot;
    cliCtxParams._windows = true;
    const mockCtx: CliCtxMock = new CliCtxMock(cliCtxParams);

    const fscParams = new FsContextMockParams();
    fscParams._ac = ac;
    fscParams._existsAbsResponses = [
      {_order: 1, _path: nodeModulesPath, _response: false } // No node_modules
    ];

    const mockFsc: FsContextMock = new FsContextMock(fscParams);

    // Create SLinkRunner with mocks
    const runner = new SLinkRunner(mockCtx, mockFsc);

    // Should throw error
    let errorThrown = false;
    try {
      runner.run();
    } catch (error) {
      errorThrown = true;
      ac.isTrue(error.message.includes('No node_modules directory found'), 'Should throw appropriate error message');
    }
    ac.isTrue(errorThrown, 'Should throw error when no node_modules exists');
  });

  public static testPublishLocalNotSymlink: Test = new Test(TestParams.of(
    'org.adligo.ts.slink_tests.SLinkRunnerApiTrial.' +
    'testPublishLocalNotSymlink'), (ac: AssertionContext) => {
    // Setup
    const projectRoot: Path = Paths.newPath('Z:/mock/current/project', false, true);
    const nodeModulesPath: Path = Paths.newPath('Z:/mock/current/project/node_modules', false, true);

    const cliCtxParams = new CliCtxMockParams();
    cliCtxParams._dir = projectRoot;
    cliCtxParams._windows = true;
    const mockCtx: CliCtxMock = new CliCtxMock(cliCtxParams);

    const fscParams = new FsContextMockParams();
    fscParams._ac = ac;
    fscParams._existsAbsResponses = [
      {_order: 1, _path: nodeModulesPath, _response: true }
    ];

    const mockFsc: FsContextMock = new FsContextMock(fscParams);

    // Mock isSymlink to return false
    mockFsc.isSymlink = (dir: Path): boolean => {
      return false;
    };

    // Create SLinkRunner with mocks
    const runner = new SLinkRunner(mockCtx, mockFsc);

    // Should throw error
    let errorThrown = false;
    try {
      runner.run();
    } catch (error) {
      errorThrown = true;
      ac.isTrue(error.message.includes('not a symlink'), 'Should throw appropriate error message');
    }
    ac.isTrue(errorThrown, 'Should throw error when node_modules is not a symlink');
  });

  public static testPublishLocalNoPackageJson: Test = new Test(TestParams.of(
    'org.adligo.ts.slink_tests.SLinkRunnerApiTrial.' +
    'testPublishLocalNoPackageJson'), (ac: AssertionContext) => {
    // Setup
    const projectRoot: Path = Paths.newPath('Z:/mock/current/project', false, true);
    const nodeModulesPath: Path = Paths.newPath('Z:/mock/current/project/node_modules', false, true);
    const projectRootPackageJson: Path = Paths.newPath('Z:/mock/current/project/package.json', false, true);
    const symlinkTarget: Path = Paths.newPath('Z:/mock/shared/node_modules', false, true);

    const cliCtxParams = new CliCtxMockParams();
    cliCtxParams._dir = projectRoot;
    cliCtxParams._windows = true;
    const mockCtx: CliCtxMock = new CliCtxMock(cliCtxParams);

    const fscParams = new FsContextMockParams();
    fscParams._ac = ac;
    fscParams._existsAbsResponses = [
      {_order: 1, _path: nodeModulesPath, _response: true },
      {_order: 2, _path: projectRootPackageJson, _response: false } // No package.json
    ];

    const mockFsc: FsContextMock = new FsContextMock(fscParams);

    // Mock isSymlink to return true
    mockFsc.isSymlink = (dir: Path): boolean => {
      return true;
    };

    // Mock getSymlinkTarget to return the target path
    mockFsc.getSymlinkTarget = (dir: Path): Path => {
      return symlinkTarget;
    };

    // Create SLinkRunner with mocks
    const runner = new SLinkRunner(mockCtx, mockFsc);

    // Should throw error
    let errorThrown = false;
    try {
      runner.run();
    } catch (error) {
      errorThrown = true;
      ac.isTrue(error.message.includes('No package.json file found'), 'Should throw appropriate error message');
    }
    ac.isTrue(errorThrown, 'Should throw error when no package.json exists');
  });

  public static testPublishLocalWithExistingPackage: Test = new Test(TestParams.of(
    'org.adligo.ts.slink_tests.SLinkRunnerApiTrial.' +
    'testPublishLocalWithExistingPackage'), (ac: AssertionContext) => {
    // Setup
    const projectRoot: Path = Paths.newPath('Z:/mock/current/project', false, true);
    const projectRootPackageJson: Path = Paths.newPath('Z:/mock/current/project/package.json', false, true);
    const nodeModulesPath: Path = Paths.newPath('Z:/mock/current/project/node_modules', false, true);
    const symlinkTarget: Path = Paths.newPath('Z:/mock/shared/node_modules', false, true);
    const targetPackageDir: Path = Paths.newPath('Z:/mock/shared/node_modules/@ts.adligo.org/slink', false, true);

    const cliCtxParams = new CliCtxMockParams();
    cliCtxParams._dir = projectRoot;
    cliCtxParams._windows = true;
    const mockCtx: CliCtxMock = new CliCtxMock(cliCtxParams);

    const fscParams = new FsContextMockParams();
    fscParams._ac = ac;
    fscParams._existsAbsResponses = [
      {_order: 1, _path: nodeModulesPath, _response: true },
      {_order: 2, _path: projectRootPackageJson, _response: true },
      {_order: 3,_path: targetPackageDir, _response: true } // Package dir exists and should be removed
    ];

    const packageJson = JSON.stringify({
      name: '@ts.adligo.org/slink',
      version: '1.5.4'
    });

    fscParams._readJsonResponses = [{ _path: projectRootPackageJson, _json: packageJson }];
    const mockFsc: FsContextMock = new FsContextMock(fscParams);

    // Mock isSymlink to return true
    mockFsc.isSymlink = (dir: Path): boolean => {
      return true;
    };

    // Mock getSymlinkTarget to return the target path
    mockFsc.getSymlinkTarget = (dir: Path): Path => {
      return symlinkTarget;
    };

    // Create SLinkRunner with mocks
    const runner = new SLinkRunner(mockCtx, mockFsc);
    runner.run();

    // TODO actually assert stuff here
    /*
    ac.isTrue(mockFsc.rmCalls.length > 0, "Should remove existing package directory");
    ac.isTrue(mockFsc.mkDirCalls.length > 0, "Should create new package directory");
     */
  });
  
  constructor() {
    super('SLinkRunnerApiTrial', [
        SLinkRunnerApiTrial.testHandleSharedNodeModulesViaEnvVar,
    //SLinkRunnerApiTrial.testHandleSharedNodeModulesViaProjectLinks,
      SLinkRunnerApiTrial.testHandleDependencySrcSLinks,
      SLinkRunnerApiTrial.testHandleDependencySLinkGroups,
      SLinkRunnerApiTrial.testFullRunWithSharedNodeModulesViaEnvVar,
      SLinkRunnerApiTrial.testHandleSharedNodeModulesViaProjectLinkDirExists,
      SLinkRunnerApiTrial.testHandleSharedNodeModulesViaProjectLinkDirMissing,
      SLinkRunnerApiTrial.testHandleSharedNodeModulesViaProjectLinkMultiDirFirstExists,
      SLinkRunnerApiTrial.testHandleSharedNodeModulesViaProjectLinkMultiDir2ndExists,
      SLinkRunnerApiTrial.testHandleSharedNodeModulesViaProjectLinkMultiDirMissing,
      SLinkRunnerApiTrial.testPublishLocalSuccess,
      SLinkRunnerApiTrial.testPublishLocalNoNodeModules,
      SLinkRunnerApiTrial.testPublishLocalNotSymlink,
      SLinkRunnerApiTrial.testPublishLocalNoPackageJson,
      SLinkRunnerApiTrial.testPublishLocalWithExistingPackage
    ]);
  }
}
