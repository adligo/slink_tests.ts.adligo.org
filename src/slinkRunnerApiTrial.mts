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
import { CliCtxMockParams, CliCtxMock, FsMock, I_ExistsAbsResponse, I_ExistsResponse, I_ReadJsonResponse, FsContextMockParams, FsContextMock, ProcMock } from "./mocks.mjs";



/**
 * The tests for SLinkRunnerApiTrial.
 * Note each test is broken out into a static member with the strange lowerCase naming convention for
 * better outlines (Structure) in Eclipse and WebStorm respectively.
 */
export class SLinkRunnerApiTrial extends ApiTrial {
  public static testHandleSharedNodeModulesViaEnvVar: Test = new Test(TestParams.of('testHandleSharedNodeModulesViaEnvVar').ignore(), (ac: AssertionContext) => {
    // Setup
    const mockCtx = new CliCtxMock(true);
    const mockFsCtx = new FsContextMock();

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
      ac.isTrue(mockFsCtx.rmCalls.length > 0, 'Should call rm to remove existing node_modules');
      ac.isTrue(mockFsCtx.slinkCalls.length > 0, 'Should call slink to create symlink');

      const slinkCall = mockFsCtx.slinkCalls[0];
      ac.same('node_modules', slinkCall.slinkName, 'Should create symlink named node_modules');
      ac.isTrue(Paths.toUnix(slinkCall.toDir).includes('/mock/node_modules/path'),
        'Should link to the path from environment variable');
    } finally {
      // Restore original process.env
      process.env = originalEnv;
    }
  });
  public static testHandleDependencySrcSLinks: Test = new Test(TestParams.of('testHandleDependencySrcSLinks').ignore(), (ac: AssertionContext) => {
    // Setup
    const mockCtx = new CliCtxMock(true);
    const mockFsCtx = new FsContextMock();

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
    ac.isTrue(mockFsCtx.rmCalls.length > 0, 'Should call rm to remove existing symlink');
    ac.isTrue(mockFsCtx.slinkCalls.length > 0, 'Should call slink to create symlink');

    const slinkCall = mockFsCtx.slinkCalls[0];
    ac.same('test-project@slink', slinkCall.slinkName, 'Should create symlink with correct name');

  });
  public static testHandleDependencySLinkGroups: Test = new Test(TestParams.of('testHandleDependencySLinkGroups'), (ac: AssertionContext) => {

    const projectRoot: Path = Paths.newPath('Z:/omock/current/project', false, true);
    const projectRootNotWindows: Path = Paths.newPath('Z:/omock/current/project', false, false);
    const projectRootPackageJson: Path = Paths.newPath('Z:/omock/current/project/package.json', false, true);
    const cliCtxParams = new CliCtxMockParams();
    cliCtxParams.dir = projectRoot;
    cliCtxParams.windows = true;
    // Setup - single project, directory exists
    const mockCtx: CliCtxMock = new CliCtxMock(cliCtxParams);
    const fscParams = new FsContextMockParams();
    fscParams.ac = ac;
    /*
    const omockSharedDeps = Paths.newPath('Z:/omock/shared_deps_foo', false, true);
    const omockSharedDepsNodeModules = Paths.newPath('Z:/omock/shared_deps_foo/node_modules', false, true);
    */
    const projectNodeModules: Path = Paths.newPath('node_modules', true, true);
    fscParams.existsAbsResponses = [{ path: projectRoot, response: true } /*,
      { path: omockSharedDeps, response: true },
      { path: omockSharedDepsNodeModules, response: true }, */
    ];
    fscParams.existsResponses = [{ relativePathParts: projectNodeModules, inDir: projectRoot, response: false }];
    const packageJson = `
 { "dependencySLinkGroups": [{ 
    "group": "@test", "projects": [{
      "project": "test-project",
      "modulePath": "test" }]
    }
]}`;
    fscParams.readJsonResponses = [{ path: projectRootPackageJson, json: packageJson }];
    const mockFsc: FsContextMock = new FsContextMock(fscParams);


    // Create SLinkRunner with mocks
    const runner = new SLinkRunner(mockCtx, mockFsc);
    runner.run();

    // Verify 6 assertions, another 10+ assertions are done in the FsContextMock
    ac.equals(1, mockCtx.doneCalls, "CliCtx.isDone() should be called once");
    ac.equals(1, mockCtx.setDirCalls, "CliCtx.setDir() should be called once");
    ac.equals(1, mockFsc.slinkCalls.length, "There should be one call to create symbolic link");
    //slink(slinkName: string, toDir: Path, inDir: Path): void;
    ac.equals("test", mockFsc.slinkCalls[0].slinkName, "The symbolic link name should match");
    const expectedRelativePath = Paths.newPath('../../../test-project/src', true, false);
    ac.equals(expectedRelativePath.toString(), mockFsc.slinkCalls[0].toDir.toString(),
        "The symbolic link should point to the test project src directory.");
    ac.equals(projectRootNotWindows.child('node_modules').child('@test').toString(), mockFsc.slinkCalls[0].inDir.toString(),
        "The symbolic link be created in the project's node_modules/@test directory.");
  });
  public static testFullRunWithSharedNodeModulesViaEnvVar: Test = new Test(TestParams.of('testFullRunWithSharedNodeModulesViaEnvVar'), (ac: AssertionContext) => {

    const projectRoot: Path = Paths.newPath('Z:/mock/current/project', false, true);
    const projectRootPackageJson: Path = Paths.newPath('Z:/mock/current/project/package.json', false, true);
    const cliCtxParams = new CliCtxMockParams();
    cliCtxParams.dir = projectRoot;
    const procMock = new ProcMock();
    procMock._env = new Map<string,string>();
    procMock._env["TEST_NODE_MODULE_SLINK"] = "Z:/omock/shared_deps_foo";
    cliCtxParams.proc = procMock;
    // Setup - single project, directory exists
    const mockCtx: CliCtxMock = new CliCtxMock(cliCtxParams);
    const fscParams = new FsContextMockParams();
    fscParams.ac = ac;
    const omockSharedDeps = Paths.newPath('Z:/omock/shared_deps_foo', false, true);
    const omockSharedDepsPackageJson = Paths.newPath('Z:/omock/shared_deps_foo/package.json', false, true);
    const omockSharedDepsNodeModules = Paths.newPath('Z:/omock/shared_deps_foo/node_modules', false, true);
    const projectNodeModules: Path = Paths.newPath('node_modules', true, true);
    fscParams.existsAbsResponses = [{ path: projectRoot, response: true },
      { path: omockSharedDeps, response: true },
      { path: omockSharedDepsPackageJson, response: true },
      { path: omockSharedDepsNodeModules, response: true },
    ];
    fscParams.existsResponses = [{ relativePathParts: projectNodeModules, inDir: projectRoot, response: false }];
    const packageJson = '{ "sharedNodeModuleProjectSLinkEnvVar": ["TEST_NODE_MODULE_SLINK"]}';
    const sharedPackageJson = '{}';
    fscParams.readJsonResponses = [{ path: projectRootPackageJson, json: packageJson }, { path: omockSharedDepsPackageJson, json: sharedPackageJson }];
    const mockFsc: FsContextMock = new FsContextMock(fscParams);


    // Create SLinkRunner with mocks
    const runner = new SLinkRunner(mockCtx, mockFsc);
    runner.run();

    // Verify 6 assertions, another 10+ assertions are done in the FsContextMock
    ac.equals(1, mockCtx.doneCalls, "CliCtx.isDone() should be called once");
    ac.equals(1, mockCtx.setDirCalls, "CliCtx.setDir() should be called once");
    ac.equals(1, mockFsc.slinkCalls.length, "There should be one call to create symbolic link");
    //slink(slinkName: string, toDir: Path, inDir: Path): void;
    ac.equals("node_modules", mockFsc.slinkCalls[0].slinkName, "The symbolic link name should match");
    ac.equals(omockSharedDepsNodeModules.toString(), mockFsc.slinkCalls[0].toDir.toString(),
        "The symbolic link should point to the shared deps projects node_modules directory.");
    ac.equals(projectRoot.toString(), mockFsc.slinkCalls[0].inDir.toString(),
        "The symbolic link should be created in the projectRoot dir. ");
  });

  public static testHandleSharedNodeModulesViaProjectLinkDirExists: Test =
    new Test(TestParams.of('testHandleSharedNodeModulesViaProjectLinkDir'), (ac: AssertionContext) => {

      const projectRoot: Path = Paths.newPath('Z:/mock/current/project', false, true);
      const projectRootPackageJson: Path = Paths.newPath('Z:/mock/current/project/package.json', false, true);
      const cliCtxParams = new CliCtxMockParams();
      cliCtxParams.dir = projectRoot;
      // Setup - single project, directory exists
      const mockCtx: CliCtxMock = new CliCtxMock(cliCtxParams);


      const fscParams = new FsContextMockParams();
      fscParams.ac = ac;
      const sharedDepsProject: Path = Paths.newPath('Z:/mock/current/shared_deps_foo', false, true);
      const sharedDepsPackageJson: Path = Paths.newPath('Z:/mock/current/shared_deps_foo/package.json', false, true);
      const sharedDepsNodeModules: Path = Paths.newPath('Z:/mock/current/shared_deps_foo/node_modules', false, true);
      const projectNodeModules: Path = Paths.newPath('node_modules', true, true);
      fscParams.existsAbsResponses = [{ path: projectRoot, response: true },
        { path: sharedDepsProject, response: true },
        { path: sharedDepsNodeModules, response: true },
        { path: sharedDepsPackageJson, response: true },
      ];
      fscParams.existsResponses = [{ relativePathParts: projectNodeModules, inDir: projectRoot, response: false }];
      const packageJson = '{ "sharedNodeModuleProjectSLinks": ["shared_deps_foo"]}';
      const sharedPackageJson = '{}';
      fscParams.readJsonResponses = [{ path: projectRootPackageJson, json: packageJson }, { path: sharedDepsPackageJson, json: sharedPackageJson}];
      const mockFsc: FsContextMock = new FsContextMock(fscParams);


      // Create SLinkRunner with mocks
      const runner = new SLinkRunner(mockCtx, mockFsc);
      runner.run();

      // Verify 6 assertions, another 13 assertions are done in the FsContextMock
      ac.equals(1, mockCtx.doneCalls, "CliCtx.isDone() should be called once");
      ac.equals(1, mockCtx.setDirCalls, "CliCtx.setDir() should be called once");
      ac.equals(1, mockFsc.slinkCalls.length, "There should be one call to create symbolic link");
      //slink(slinkName: string, toDir: Path, inDir: Path): void;
      ac.equals("node_modules", mockFsc.slinkCalls[0].slinkName, "The symbolic link name should match");
      ac.equals(sharedDepsNodeModules.toString(), mockFsc.slinkCalls[0].toDir.toString(),
          "The symbolic link should point to the shared deps projects node_modules directory.");
      ac.equals(projectRoot.toString(), mockFsc.slinkCalls[0].inDir.toString(),
          "The symbolic link should be created in the projectRoot dir. ");
    });


  public static testHandleSharedNodeModulesViaProjectLinkDirMissing: Test = new Test(
    TestParams.of('testHandleSharedNodeModulesViaProjectLinkDirMissing'), (ac: AssertionContext) => {

    const projectRoot: Path = Paths.newPath('Z:/mock/current/project', false, true);
    const projectRootPackageJson: Path = Paths.newPath('Z:/mock/current/project/package.json', false, true);
    const cliCtxParams = new CliCtxMockParams();
    cliCtxParams.dir = projectRoot;
    // Setup - single project, directory exists
    const mockCtx: CliCtxMock = new CliCtxMock(cliCtxParams);


    const fscParams = new FsContextMockParams();
    fscParams.ac = ac;
    const sharedDepsProjectPath: Path = Paths.newPath('Z:/mock/current/shared_deps_foo', false, true);
    const projectNodeModules: Path = Paths.newPath('node_modules', true, true);
    fscParams.existsAbsResponses = [{ path: projectRoot, response: true },
      { path: sharedDepsProjectPath, response: false },
      { path: Paths.newPath('Z:/mock/shared_deps_foo', false, true), response: false},
      { path: Paths.newPath('Z:/shared_deps_foo', false, true), response: false},
    ];
    fscParams.existsResponses = [{ relativePathParts: projectNodeModules, inDir: projectRoot, response: false }];
    const packageJson = '{ "sharedNodeModuleProjectSLinks": ["shared_deps_foo"]}';
    fscParams.readJsonResponses = [{ path: projectRootPackageJson, json: packageJson }];
    const mockFsc: FsContextMock = new FsContextMock(fscParams);


    // Create SLinkRunner with mocks
    const runner = new SLinkRunner(mockCtx, mockFsc);
    runner.run();

    // Verify 3 assertions, another 11 assertions are done in the FsContextMock
    ac.equals(1, mockCtx.doneCalls, "CliCtx.isDone() should be called once");
    ac.equals(1, mockCtx.setDirCalls, "CliCtx.setDir() should be called once");
    ac.equals(0, mockFsc.slinkCalls.length, "There should be one call to create symbolic link");
  });


  public static testHandleSharedNodeModulesViaProjectLinkMultiDirFirstExists: Test = new Test(
    TestParams.of('testHandleSharedNodeModulesViaProjectLinkMultiDirFirstExists'), (ac: AssertionContext) => {

    const projectRoot: Path = Paths.newPath('Z:/mock/current/project', false, true);
    const projectRootPackageJson: Path = Paths.newPath('Z:/mock/current/project/package.json', false, true);
    const cliCtxParams = new CliCtxMockParams();
    cliCtxParams.dir = projectRoot;
    // Setup - single project, directory exists
    const mockCtx: CliCtxMock = new CliCtxMock(cliCtxParams);


    const fscParams = new FsContextMockParams();
    fscParams.ac = ac;
    const shareDeps = Paths.newPath('Z:/mock/current/shared_deps_foo3', false, true);
    const shareDepsNodeModules = Paths.newPath('Z:/mock/current/shared_deps_foo3/node_modules', false, true);
    const shareDepsPackageJson = Paths.newPath('Z:/mock/current/shared_deps_foo3/package.json', false, true);
    const projectNodeModules: Path = Paths.newPath('node_modules', true, true);
    fscParams.existsAbsResponses = [{ path: projectRoot, response: true },
      { path: shareDeps, response: true },
      { path: shareDepsNodeModules, response: true },
      { path: shareDepsPackageJson, response: true }
    ];
    fscParams.existsResponses = [{ relativePathParts: projectNodeModules, inDir: projectRoot, response: false }];
    const packageJson = '{ "sharedNodeModuleProjectSLinks": ["shared_deps_foo3","other_shared_deps"]}';
    const sharedPackageJson = '{}';
    fscParams.readJsonResponses = [{ path: projectRootPackageJson, json: packageJson }, { path: shareDepsPackageJson, json: sharedPackageJson}];
    const mockFsc: FsContextMock = new FsContextMock(fscParams);


    // Create SLinkRunner with mocks
    const runner = new SLinkRunner(mockCtx, mockFsc);
    runner.run();

    // Verify 3 assertions, another 10+ assertions are done in the FsContextMock
    ac.equals(1, mockCtx.doneCalls, "CliCtx.isDone() should be called once");
    ac.equals(1, mockCtx.setDirCalls, "CliCtx.setDir() should be called once");
    ac.equals(1, mockFsc.slinkCalls.length, "There should be one call to create symbolic link");
    ac.equals("node_modules", mockFsc.slinkCalls[0].slinkName, "The symbolic link name should match");
    ac.equals(shareDepsNodeModules.toString(), mockFsc.slinkCalls[0].toDir.toString(),
        "The symbolic link should point to the shared deps projects node_modules directory.");
    ac.equals(projectRoot.toString(), mockFsc.slinkCalls[0].inDir.toString(),
        "The symbolic link should be created in the projectRoot dir. ");
  });


  public static testHandleSharedNodeModulesViaProjectLinkMultiDir2ndExists: Test = new Test(
    TestParams.of('testHandleSharedNodeModulesViaProjectLinkMultiDir2ndExists'), (ac: AssertionContext) => {

    const projectRoot: Path = Paths.newPath('Z:/mock/current/project', false, true);
    const projectRootPackageJson: Path = Paths.newPath('Z:/mock/current/project/package.json', false, true);
    const cliCtxParams = new CliCtxMockParams();
    cliCtxParams.dir = projectRoot;
    // Setup - single project, directory exists
    const mockCtx: CliCtxMock = new CliCtxMock(cliCtxParams);


    const fscParams = new FsContextMockParams();
    fscParams.ac = ac;
    const otherShareDeps = Paths.newPath('Z:/mock/current/other_shared_deps', false, true);
    const otherShareDepsNodeModules = Paths.newPath('Z:/mock/current/other_shared_deps/node_modules', false, true);
    const otherShareDepsPackageJson = Paths.newPath('Z:/mock/current/other_shared_deps/package.json', false, true);
    const projectNodeModules: Path = Paths.newPath('node_modules', true, true);
    fscParams.existsAbsResponses = [{ path: projectRoot, response: true },
      { path: Paths.newPath('Z:/mock/current/shared_deps_foo', false, true), response: false },
      { path: otherShareDeps, response: true },
      { path: otherShareDepsNodeModules, response: true },
      { path: otherShareDepsPackageJson, response: true },
    ];
    fscParams.existsResponses = [{ relativePathParts: projectNodeModules, inDir: projectRoot, response: false }];
    const packageJson = '{ "sharedNodeModuleProjectSLinks": ["shared_deps_foo","other_shared_deps"]}';
    const sharedPackageJson = '{}';
    fscParams.readJsonResponses = [{ path: projectRootPackageJson, json: packageJson }, { path: otherShareDepsPackageJson, json: sharedPackageJson }];
    const mockFsc: FsContextMock = new FsContextMock(fscParams);


    // Create SLinkRunner with mocks
    const runner = new SLinkRunner(mockCtx, mockFsc);
    runner.run();

    // Verify 3 assertions, another 10+ assertions are done in the FsContextMock
    ac.equals(1, mockCtx.doneCalls, "CliCtx.isDone() should be called once");
    ac.equals(1, mockCtx.setDirCalls, "CliCtx.setDir() should be called once");
    ac.equals(1, mockFsc.slinkCalls.length, "There should be one call to create symbolic link");
    ac.equals("node_modules", mockFsc.slinkCalls[0].slinkName, "The symbolic link name should match");
    ac.equals(otherShareDepsNodeModules.toString(), mockFsc.slinkCalls[0].toDir.toString(),
        "The symbolic link should point to the shared deps projects node_modules directory.");
    ac.equals(projectRoot.toString(), mockFsc.slinkCalls[0].inDir.toString(),
        "The symbolic link should be created in the projectRoot dir. ");
  });


  public static testHandleSharedNodeModulesViaProjectLinkMultiDirMissing: Test = new Test(
    TestParams.of('testHandleSharedNodeModulesViaProjectLinkMultiDirMissing'), (ac: AssertionContext) => {

    const projectRoot: Path = Paths.newPath('Z:/mock/current/project', false, true);
    const projectRootPackageJson: Path = Paths.newPath('Z:/mock/current/project/package.json', false, true);
    const cliCtxParams = new CliCtxMockParams();
    cliCtxParams.dir = projectRoot;
    // Setup - single project, directory exists
    const mockCtx: CliCtxMock = new CliCtxMock(cliCtxParams);


    const fscParams = new FsContextMockParams();
    fscParams.ac = ac;
    const projectNodeModules: Path = Paths.newPath('node_modules', true, true);
    fscParams.existsAbsResponses = [{ path: projectRoot, response: true },
      { path: Paths.newPath('Z:/mock/current/shared_deps_foo', false, true), response: false },
      { path: Paths.newPath('Z:/mock/current/other_shared_deps', false, true), response: false },
      { path: Paths.newPath('Z:/mock/shared_deps_foo', false, true), response: false },
      { path: Paths.newPath('Z:/mock/other_shared_deps', false, true), response: false },
      { path: Paths.newPath('Z:/shared_deps_foo', false, true), response: false },
      { path: Paths.newPath('Z:/other_shared_deps', false, true), response: false },
    ];
    fscParams.existsResponses = [{ relativePathParts: projectNodeModules, inDir: projectRoot, response: false }];
    const packageJson = '{ "sharedNodeModuleProjectSLinks": ["shared_deps_foo","other_shared_deps"]}';
    fscParams.readJsonResponses = [{ path: projectRootPackageJson, json: packageJson }];
    const mockFsc: FsContextMock = new FsContextMock(fscParams);


    // Create SLinkRunner with mocks
    const runner = new SLinkRunner(mockCtx, mockFsc);
    runner.run();

    // Verify 3 assertions, another 10+ assertions are done in the FsContextMock
    ac.equals(1, mockCtx.doneCalls, "CliCtx.isDone() should be called once");
    ac.equals(1, mockCtx.setDirCalls, "CliCtx.setDir() should be called once");
    ac.equals(0, mockFsc.slinkCalls.length, "There should be one call to create symbolic link");
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
      SLinkRunnerApiTrial.testHandleSharedNodeModulesViaProjectLinkMultiDirMissing
    ]);
  }
}