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

import { ApiTrial, AssertionContext, Test, TestParams } from '../../../../tests4ts.ts.adligo.org/src/tests4ts.mjs';
import { I_CliCtx, I_FsContext, SLinkRunner, Path, Paths } from '../../../../slink.ts.adligo.org/src/slink.mjs';
import { CliCtxMock, FsContextMock, CliCtxMockParams, FsContextMockParams, I_ExistsAbsResponse, I_ExistsResponse, I_ReadJsonResponse } from '../mocks/mocks.mjs';

export class HandleDependencySLinkGroupsUnix extends ApiTrial {
  public static testHandleDependencySLinkGroups: Test = new Test(TestParams.of(
    'org.adligo.ts.slink_tests.HandleDependencySLinkGroupsUnix.' +
    'testHandleDependencySLinkGroups'), (ac: AssertionContext) => {

    const projectRoot: Path = Paths.newPath('/omock/current/project', false, false);
    const projectRootPackageJson: Path = Paths.newPath('/omock/current/project/package.json', false, false);
    const cliCtxParams = new CliCtxMockParams();
    cliCtxParams._dir = projectRoot;
    cliCtxParams._windows = false;
    // Setup - single project, directory exists
    const mockCtx: CliCtxMock = new CliCtxMock(cliCtxParams);
    const fscParams = new FsContextMockParams();
    fscParams._ac = ac;
    const projectNodeModules: Path = Paths.newPath('node_modules', true, false);
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
    ac.equals(projectRoot.child('node_modules').child('@test').toString(), slinkCall0._inDir.toString(),
        "The symbolic link be created in the project's node_modules/@test directory.");
  });

  constructor() {
    super('HandleDependencySLinkGroupsUnix', [HandleDependencySLinkGroupsUnix.testHandleDependencySLinkGroups]);
  }
}
