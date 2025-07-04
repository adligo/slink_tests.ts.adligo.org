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
import { CliCtxMock, FsContextMock, CliCtxMockParams, FsContextMockParams, I_ExistsAbsResponse, I_ExistsResponse, I_ReadJsonResponse, ProcMock } from '../mocks/mocks.mjs';
import { fchmodSync } from 'node:fs';

export class HandleSharedNodeModulesViaEnvVarWindows extends ApiTrial {
  public static readonly TESTS: I_Test[] = [
    new Test(TestParams.of('testHandleSharedNodeModulesViaEnvVar').ignore(), (ac: I_AssertionContext) => {

      ac.isTrue(false, "TODO this code was generated by AI and needs auditing");
      // Setup

      const mockCtx = new CliCtxMock(new CliCtxMockParams());
      let fsCtxParams = new FsContextMockParams();
      fsCtxParams._ac = ac;
      const mockFsCtx = new FsContextMock(fsCtxParams);

      // Save original process.env
      const originalEnv = process.env;

      try {
        // Mock process.env
        process.env = { ...originalEnv, TEST_NODE_MODULE_SLINK: 'Z:/mock/node_modules/path' };

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
    }),
    new Test('testFullRunWithSharedNodeModulesViaEnvVar', (ac: I_AssertionContext) => {

      const projectRoot: Path = Paths.newPath('Z:/mock/current/project', false, true);
      const projectRootPackageJson: Path = Paths.newPath('Z:/mock/current/project/package.json', false, true);
      const cliCtxParams = new CliCtxMockParams();
      cliCtxParams._dir = projectRoot;
      const procMock = new ProcMock();
      procMock._env = new Map<string, string>();
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
      fscParams._existsAbsResponses = [{ _order: 1, _path: projectRoot, _response: true },
      { _order: 2, _path: projectRoot.child('package.json'), _response: true },
      { _order: 3, _path: omockSharedDepsNodeModules, _response: true },
      { _order: 4, _path: omockSharedDepsPackageJson, _response: true },
      ];
      fscParams._existsResponses = [{ _order: 1, _fileOrDir: 'node_modules', _inDir: projectRoot, _response: false }];
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
    })
  ];

  constructor() {
    super('HandleSharedNodeModulesViaEnvVarWindows', HandleSharedNodeModulesViaEnvVarWindows.TESTS);
  }
}
