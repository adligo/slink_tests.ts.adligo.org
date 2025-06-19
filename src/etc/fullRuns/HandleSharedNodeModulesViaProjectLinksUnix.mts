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

import { I_AssertionContext, I_Test } from '../../../../i_tests4ts.ts.adligo.org/src/i_tests4ts.mjs';
import { ApiTrial } from '../../../../tests4ts.ts.adligo.org/src/trials.mjs';
import { Test, TestParams } from '../../../../tests4ts.ts.adligo.org/src/tests.mjs';
import { I_CliCtx, I_FsContext, SLinkRunner, Path, Paths } from '../../../../slink.ts.adligo.org/src/slink.mjs';
import { CliCtxMock, FsContextMock, CliCtxMockParams, FsContextMockParams, I_ExistsAbsResponse, I_ExistsResponse, I_ReadJsonResponse } from '../mocks/mocks.mjs';

export class HandleSharedNodeModulesViaProjectLinksUnix extends ApiTrial {
  public static readonly TESTS: I_Test[] = [
    new Test('testHandleSharedNodeModulesViaProjectLinkDirExists', (ac: I_AssertionContext) => {

      const projectRoot: Path = Paths.newPath('/mock/current/project', false, false);
      const projectRootPackageJson: Path = Paths.newPath('/mock/current/project/package.json', false, false);
      const cliCtxParams = new CliCtxMockParams();
      cliCtxParams._dir = projectRoot;
      cliCtxParams._windows = false;
      // Setup - single project, directory exists
      const mockCtx: CliCtxMock = new CliCtxMock(cliCtxParams);


      const fscParams = new FsContextMockParams();
      fscParams._ac = ac;
      const sharedDepsProject: Path = Paths.newPath('/mock/current/shared_deps_foo', false, false);
      const sharedDepsPackageJson: Path = Paths.newPath('/mock/current/shared_deps_foo/package.json', false, false);
      const sharedDepsNodeModules: Path = Paths.newPath('/mock/current/shared_deps_foo/node_modules', false, false);
      const projectNodeModules: Path = Paths.newPath('node_modules', true, false);
      fscParams._existsAbsResponses = [{ _order: 1, _path: projectRoot, _response: true },
      { _order: 2, _path: projectRoot.child('package.json'), _response: true },
      { _order: 3, _path: sharedDepsProject, _response: true },
      { _order: 4, _path: sharedDepsNodeModules, _response: true },
      { _order: 5, _path: sharedDepsPackageJson, _response: true },
      ];
      fscParams._existsResponses = [{ _order: 1, _fileOrDir: 'node_modules', _inDir: projectRoot, _response: false }];
      const packageJson = '{ "sharedNodeModuleProjectSLinks": ["shared_deps_foo"]}';
      const sharedPackageJson = '{}';
      fscParams._readJsonResponses = [{ _path: projectRootPackageJson, _json: packageJson }, { _path: sharedDepsPackageJson, _json: sharedPackageJson }];
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
    }),
    new Test('testHandleSharedNodeModulesViaProjectLinkDirMissing', (ac: I_AssertionContext) => {

      const projectRoot: Path = Paths.newPath('/mock/current/project', false, false);
      const projectRootPackageJson: Path = Paths.newPath('/mock/current/project/package.json', false, false);
      const cliCtxParams = new CliCtxMockParams();
      cliCtxParams._dir = projectRoot;
      cliCtxParams._windows = false;
      // Setup - single project, directory exists
      const mockCtx: CliCtxMock = new CliCtxMock(cliCtxParams);


      const fscParams = new FsContextMockParams();
      fscParams._ac = ac;
      const sharedDepsProjectPath: Path = Paths.newPath('/mock/current/shared_deps_foo', false, false);
      const projectNodeModules: Path = Paths.newPath('node_modules', true, false);
      fscParams._existsAbsResponses = [{ _order: 1, _path: projectRoot, _response: true },
      { _order: 2, _path: projectRoot.child('package.json'), _response: true },
      { _order: 3, _path: sharedDepsProjectPath, _response: false },
      { _order: 4, _path: Paths.newPath('/mock/shared_deps_foo', false, false), _response: false },
      { _order: 5, _path: Paths.newPath('/shared_deps_foo', false, false), _response: false },
      ];
      fscParams._existsResponses = [{ _order: 1, _fileOrDir: 'node_modules', _inDir: projectRoot, _response: false }];
      const packageJson = '{ "sharedNodeModuleProjectSLinks": ["shared_deps_foo"]}';
      fscParams._readJsonResponses = [{ _path: projectRootPackageJson, _json: packageJson }];
      const mockFsc: FsContextMock = new FsContextMock(fscParams);


      // Create SLinkRunner with mocks
      const runner = new SLinkRunner(mockCtx, mockFsc);
      runner.run();

      // Verify 3 assertions, another 11 assertions are done in the FsContextMock
      ac.equals(1, mockCtx.getDoneCalls(), "CliCtx.isDone() should be called once");
      ac.equals(1, mockCtx.getSetDirCalls(), "CliCtx.setDir() should be called once");
      ac.equals(0, mockFsc.getSlinkCalls(), "There should be zero calls to create symbolic links.");
    }),
    new Test('testHandleSharedNodeModulesViaProjectLinkMultiDirFirstExists', (ac: I_AssertionContext) => {

      const projectRoot: Path = Paths.newPath('/mock/current/project', false, false);
      const projectRootPackageJson: Path = Paths.newPath('/mock/current/project/package.json', false, false);
      const cliCtxParams = new CliCtxMockParams();
      cliCtxParams._dir = projectRoot;
      cliCtxParams._windows = false;
      // Setup - single project, directory exists
      const mockCtx: CliCtxMock = new CliCtxMock(cliCtxParams);


      const fscParams = new FsContextMockParams();
      fscParams._ac = ac;
      const shareDeps = Paths.newPath('/mock/current/shared_deps_foo3', false, false);
      const shareDepsNodeModules = Paths.newPath('/mock/current/shared_deps_foo3/node_modules', false, false);
      const shareDepsPackageJson = Paths.newPath('/mock/current/shared_deps_foo3/package.json', false, false);
      const projectNodeModules: Path = Paths.newPath('node_modules', true, false);
      fscParams._existsAbsResponses = [{ _order: 1, _path: projectRoot, _response: true },
      { _order: 2, _path: projectRoot.child('package.json'), _response: true },
      { _order: 3, _path: shareDeps, _response: true },
      { _order: 4, _path: shareDepsNodeModules, _response: true },
      { _order: 5, _path: shareDepsPackageJson, _response: true }
      ];
      fscParams._existsResponses = [{ _order: 1, _fileOrDir: 'node_modules', _inDir: projectRoot, _response: false }];
      const packageJson = '{ "sharedNodeModuleProjectSLinks": ["shared_deps_foo3","other_shared_deps"]}';
      const sharedPackageJson = '{}';
      fscParams._readJsonResponses = [{ _path: projectRootPackageJson, _json: packageJson }, { _path: shareDepsPackageJson, _json: sharedPackageJson }];
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
    }),
    new Test('testHandleSharedNodeModulesViaProjectLinkMultiDir2ndExists', (ac: I_AssertionContext) => {

      const projectRoot: Path = Paths.newPath('/mock/current/project', false, false);
      const projectRootPackageJson: Path = Paths.newPath('/mock/current/project/package.json', false, false);
      const cliCtxParams = new CliCtxMockParams();
      cliCtxParams._dir = projectRoot;
      cliCtxParams._windows = false;
      // Setup - single project, directory exists
      const mockCtx: CliCtxMock = new CliCtxMock(cliCtxParams);


      const fscParams = new FsContextMockParams();
      fscParams._ac = ac;
      const otherShareDeps = Paths.newPath('/mock/current/other_shared_deps', false, false);
      const otherShareDepsNodeModules = Paths.newPath('/mock/current/other_shared_deps/node_modules', false, false);
      const otherShareDepsPackageJson = Paths.newPath('/mock/current/other_shared_deps/package.json', false, false);
      const projectNodeModules: Path = Paths.newPath('node_modules', true, false);
      fscParams._existsAbsResponses = [{ _order: 1, _path: projectRoot, _response: true },
      { _order: 2, _path: projectRoot.child('package.json'), _response: true },
      { _order: 3, _path: Paths.newPath('/mock/current/shared_deps_foo', false, false), _response: false },
      { _order: 4, _path: otherShareDeps, _response: true },
      { _order: 5, _path: otherShareDepsNodeModules, _response: true },
      { _order: 6, _path: otherShareDepsPackageJson, _response: true },
      ];
      fscParams._existsResponses = [{ _order: 0, _fileOrDir: 'node_modules', _inDir: projectRoot, _response: false }];
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
    }),
    new Test('testHandleSharedNodeModulesViaProjectLinkMultiDirMissing', (ac: I_AssertionContext) => {

      const projectRoot: Path = Paths.newPath('/mock/current/project', false, false);
      const projectRootPackageJson: Path = Paths.newPath('/mock/current/project/package.json', false, false);
      const cliCtxParams = new CliCtxMockParams();
      cliCtxParams._dir = projectRoot;
      cliCtxParams._windows = false;
      // Setup - single project, directory exists
      const mockCtx: CliCtxMock = new CliCtxMock(cliCtxParams);


      const fscParams = new FsContextMockParams();
      fscParams._ac = ac;
      const projectNodeModules: Path = Paths.newPath('node_modules', true, false);
      fscParams._existsAbsResponses = [{ _order: 1, _path: projectRoot, _response: true },
      { _order: 2, _path: projectRoot.child('package.json'), _response: true },
      { _order: 3, _path: Paths.newPath('/mock/current/shared_deps_foo', false, false), _response: false },
      { _order: 4, _path: Paths.newPath('/mock/current/other_shared_deps', false, false), _response: false },
      { _order: 5, _path: Paths.newPath('/mock/shared_deps_foo', false, false), _response: false },
      { _order: 6, _path: Paths.newPath('/mock/other_shared_deps', false, false), _response: false },
      { _order: 7, _path: Paths.newPath('/shared_deps_foo', false, false), _response: false },
      { _order: 8, _path: Paths.newPath('/other_shared_deps', false, false), _response: false },
      ];
      fscParams._existsResponses = [{ _order: 1, _fileOrDir: 'node_modules', _inDir: projectRoot, _response: false }];
      const packageJson = '{ "sharedNodeModuleProjectSLinks": ["shared_deps_foo","other_shared_deps"]}';
      fscParams._readJsonResponses = [{ _path: projectRootPackageJson, _json: packageJson }];
      const mockFsc: FsContextMock = new FsContextMock(fscParams);


      // Create SLinkRunner with mocks
      const runner = new SLinkRunner(mockCtx, mockFsc);
      runner.run();

      // Verify 3 assertions, another 11 assertions are done in the FsContextMock
      ac.equals(1, mockCtx.getDoneCalls(), "CliCtx.isDone() should be called once");
      ac.equals(1, mockCtx.getSetDirCalls(), "CliCtx.setDir() should be called once");
      ac.equals(0, mockFsc.getSlinkCalls(), "There should be no calls to create symbolic links.");
    })
  ];

  constructor() {
    super('HandleSharedNodeModulesViaProjectLinksUnix', HandleSharedNodeModulesViaProjectLinksUnix.TESTS);
  }
}
