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


import { ApiTrial, AssertionContext, Test, TrialSuite } from '../../tests4ts.ts.adligo.org/src/tests4ts.mjs';
import {
  CliCtx, CliCtxArg,
  FsContext,
  I_CliCtx,
  I_Fs,
  I_FsContext,
  I_Proc,
  Path,
  Paths,
  SLinkRunner
} from '../../slink.ts.adligo.org/src/slink.mjs';
import { FsMock } from "./mocks.mjs";

process.env['RUNNING_TESTS4TS'] = true

class CliCtxMockParams {
  bash: boolean = true;
  debug: boolean = true;
  dir: Path;
  done: boolean = false;
  windows: boolean = true;

}

class CliCtxMock implements I_CliCtx {
  bash: boolean;
  debug: boolean;
  dir: Path;
  done: boolean = false;
  doneCalls: number = 0;
  outCalls: string[] = [];
  printCalls: string[] = [];
  logCmdCalls: any[] = [];
  runCalls: any[] = [];
  setDirCalls: number = 0;
  windows: boolean;


  constructor(params: CliCtxMockParams) {
    this.debug = params.debug;
    this.windows = params.windows;
    this.bash = params.bash;
    this.dir = params.dir;
  }

  getFs(): I_Fs {
    throw new Error('Method not implemented.');
  }
  getKeys(): string[] {
    throw new Error('Method not implemented.');
  }
  getValue(key: string): CliCtxArg {
    throw new Error('Method not implemented.');
  }
  getHome(): Path {
    throw new Error('Method not implemented.');
  }
  isInMap(key: string): boolean {
    throw new Error('Method not implemented.');
  }
  getProc(): I_Proc {
    throw new Error('Method not implemented.');
  }

  isDebug(): boolean { return this.debug; }
  isDone(): boolean { this.doneCalls++; return this.done; }
  isWindows(): boolean { return this.windows; }
  isBash(): boolean { return this.bash; }
  getDir(): Path { return this.dir; }
  setDir(): void { this.setDirCalls++; }

  run(cmd: string, args: string[], options?: any, logLevel?: number): any {
    this.runCalls.push({ cmd, args, options, logLevel });
    return { stdout: 'mock output' };
  }

  out(message: string): void {
    console.log('out: ' + message);
    this.outCalls.push(message);
  }

  print(message: string): void {
    console.log('print: ' + message);
    this.printCalls.push(message);
  }

  logCmd(cmdWithArgs: string, spawnSyncReturns: any, options?: any): void {
    this.logCmdCalls.push({ cmdWithArgs, spawnSyncReturns, options })
  }
}

interface I_ExistsAbsResponse {
  path: Path;
  response: boolean;
}

interface I_ExistsResponse {
  relativePathParts: Path;
  inDir: Path;
  response: boolean;
}

interface I_ReadJsonResponse {
  path: Path;
  json: string;
}

class FsContextMockParams {
  ac: AssertionContext;
  existsAbsResponses: I_ExistsAbsResponse[] = [];
  existsResponses: I_ExistsResponse[] = [];
  readJsonResponses: I_ReadJsonResponse[] = [];
}

class FsContextMock implements I_FsContext {
  ac: AssertionContext;
  ordnalCounter: number = 0;
  existsAbsCalls: any[] = [];
  existsAbsCounter: number = 0;
  existsAbsResponses: any[];
  existsCalls: any[] = [];
  existsCounter: number = 0;
  existsResponses: any[];
  fsMock: FsMock = new FsMock()
  mkDirCalls: any[] = [];
  readCalls: any[] = [];
  readJsonCalls: any[] = [];
  readJsonCounter: number = 0;
  readJsonResponses: I_ReadJsonResponse[];
  rmCalls: any[] = [];
  slinkCalls: any[] = [];
  mkdirTreeCalls: any[] = [];

  mockPackageJson: any = {};

  constructor(params: FsContextMockParams) {
    if (params.ac != undefined) {
      this.ac = params.ac;
    } else {
      throw new Error('Invalid ac');
    }
    this.existsAbsResponses = params.existsAbsResponses;
    this.existsResponses = params.existsResponses;
    this.readJsonResponses = params.readJsonResponses;
  }

  existsAbs(path: Path): boolean {
    this.existsAbsCalls.push({ order: this.ordnalCounter++, path: path });
    this.ac.isTrue(this.existsAbsCounter < this.existsAbsResponses.length,
      "No more existsAbs responses!");
    let r = this.existsAbsResponses[this.existsAbsCounter++];
    this.ac.equals(r.path.toString(), path.toString(), "Paths should match expected");
    return r.response;
  }

  exists(relativePathParts: Path, inDir: Path): boolean {
    this.existsCalls.push({ order: this.ordnalCounter++, relativePathParts: relativePathParts, inDir: inDir });
    this.ac.isTrue(this.existsCounter < this.existsResponses.length,
      "No more exists responses!");
    let r = this.existsResponses[this.existsCounter++];
    this.ac.equals(r.relativePathParts.toString(), relativePathParts.toString(), "Relative path parts should match");
    this.ac.equals(r.inDir.toString(), inDir.toString(), "Relative path parts inDir should match");
    return r.response;
  }

  getFs(): I_Fs {
    return this.fsMock;
  }
  mkdir(dir: string, inDir: Path): void {
    this.mkDirCalls.push({ order: this.ordnalCounter++, dir: dir, inDir: inDir });
  }
  read(path: Path, charset?: string) {
    this.readCalls.push({ order: this.ordnalCounter++, dir: path, charset: charset });
  }

  readJson(path: Path): any {
    this.readJsonCalls.push({ order: this.ordnalCounter++, path: path });
    this.ac.isTrue(this.readJsonCounter < this.readJsonResponses.length,
      "No more read json responses!");
    let r = this.readJsonResponses[this.readJsonCounter++];
    this.ac.equals(r.path.toString(), path.toString(), "Read Json paths should match");
    return JSON.parse(r.json);
  }

  rm(pathParts: Path, inDir: Path): void {
    this.rmCalls.push({ order: this.ordnalCounter++, pathParts: pathParts, inDir: inDir });
  }

  slink(slinkName: string, toDir: Path, inDir: Path): void {
    this.slinkCalls.push({ order: this.ordnalCounter++, slinkName, toDir, inDir });
  }

  mkdirTree(dirs: Path, inDir: Path): Path {
    this.mkdirTreeCalls.push({ order: this.ordnalCounter++, dirs: dirs, inDir: inDir });
    return new Path(inDir.getParts().concat(dirs.getParts()), false);
  }
}

/**
 * The tests for SLinkRunnerApiTrial.
 * Note each test is broken out into a static member with the strange lowerCase naming convention for
 * better outlines (Structure) in Eclipse and WebStorm respectively.
 */
export class SLinkRunnerApiTrial extends ApiTrial {
  public static testHandleSharedNodeModulesViaEnvVar: Test = new Test('testHandleSharedNodeModulesViaEnvVar', (ac: AssertionContext) => {
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
  public static testHandleSharedNodeModulesViaProjectLinks: Test = new Test('testHandleSharedNodeModulesViaProjectLinks', (ac: AssertionContext) => {
    // Setup
    const mockCtx = new CliCtxMock(true, true, true);
    const mockFsCtx = new FsContextMock();

    // Setup mock package.json
    mockFsCtx.mockPackageJson = {
      sharedNodeModuleProjectSLinks: ['slink_group_deps.ts.adligo.org']
    };

    // Mock directory structure
    mockCtx.dir = Paths.toPath('/mock/project/current', false);

    // Create SLinkRunner with mocks
    const runner = new SLinkRunner(mockCtx as any);
    //TODO fix this code and tests
    /*
    runner.run();

    // Verify
    ac.equals(1, mockCtx.doneCalls, "IsDone should be called once.");
    ac.equals(1, mockCtx.setDirCalls, "SetDir should be called once.");

    ac.equals('ls', mockCtx.runCalls[0].cmd) ;

    ac.equals(3, mockFsCtx.existsAbsCalls.length, 'The number of dirs/files checked for existance.')

    // Check that the first existsAbs call is for the project path
    const projectPathCall = mockFsCtx.existsAbsCalls[0];
    ac.isTrue(Paths.toUnix(projectPathCall).includes('slink_group_deps.ts.adligo.org'),
        'Should check for project directory');

    // If project exists, should check for node_modules
    if (mockFsCtx.existsAbsCalls.length >= 2) {
        const nodeModulesPathCall = mockFsCtx.existsAbsCalls[1];
        ac.isTrue(Paths.toUnix(nodeModulesPathCall).includes('node_modules'),
            'Should check for node_modules directory');
    }

    // If project exists, should create symlink
    if (mockFsCtx.slinkCalls.length > 0) {
        const slinkCall = mockFsCtx.slinkCalls[0];
        ac.same('node_modules', slinkCall.slinkName, 'Should create symlink named node_modules');
    }
    */
  });
  public static testHandleDependencySrcSLinks: Test = new Test('testHandleDependencySrcSLinks', (ac: AssertionContext) => {
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
  public static testHandleDependencySLinkGroups: Test = new Test('testHandleDependencySLinkGroups', (ac: AssertionContext) => {
    // Setup
    const mockCtx = new CliCtxMock(true);
    const mockFsCtx = new FsContextMock();

    // Setup mock package.json
    mockFsCtx.mockPackageJson = {
      dependencySLinkGroups: [{
        group: '@test',
        projects: [{
          project: 'test-project',
          modulePath: 'test'
        }]
      }]
    };

    // Create SLinkRunner with mocks
    const runner = new SLinkRunner(mockCtx as any);
    (runner as any).fsCtx = mockFsCtx;

    // Run the method directly
    (runner as any).handleDependencySLinkGroups([{
      group: '@test',
      projects: [{
        project: 'test-project',
        modulePath: 'test'
      }]
    }]);

    // Verify
    ac.isTrue(mockFsCtx.rmCalls.length > 0, 'Should call rm to remove existing directory');
    ac.isTrue(mockFsCtx.mkdirTreeCalls.length > 0, 'Should call mkdirTree to create directory structure');
    ac.isTrue(mockFsCtx.slinkCalls.length > 0, 'Should call slink to create symlink');

    const slinkCall = mockFsCtx.slinkCalls[0];
    ac.same('test', slinkCall.slinkName, 'Should create symlink with correct name');
  });
  public static testFullRunWithSharedNodeModulesViaEnvVar: Test = new Test('testFullRunWithSharedNodeModulesViaEnvVar', (ac: AssertionContext) => {
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
        sharedNodeModuleProjectSLinkEnvVar: ['TEST_NODE_MODULE_SLINK'],
        dependencySrcSLinks: [{
          project: 'test-project'
        }],
        dependencySLinkGroups: [{
          group: '@test',
          projects: [{
            project: 'test-project',
            modulePath: 'test'
          }]
        }]
      };

      // Create SLinkRunner with mocks
      const runner = new SLinkRunner(mockCtx as any);
      (runner as any).fsCtx = mockFsCtx;

      // Run the full runner
      runner.run();

      // Verify
      ac.isTrue(mockFsCtx.readJsonCalls.length > 0, 'Should read package.json');

      // Should have created symlinks for all three types
      const nodeModulesSymlink = mockFsCtx.slinkCalls.find(call => call.slinkName === 'node_modules');
      ac.isTrue(nodeModulesSymlink !== undefined, 'Should create node_modules symlink');

      const srcSymlink = mockFsCtx.slinkCalls.find(call => call.slinkName === 'test-project@slink');
      ac.isTrue(srcSymlink !== undefined, 'Should create source symlink');

      const groupSymlink = mockFsCtx.slinkCalls.find(call => call.slinkName === 'test');
      ac.isTrue(groupSymlink !== undefined, 'Should create group symlink');
    } finally {
      // Restore original process.env
      process.env = originalEnv;
    }
  });

  public static testHandleSharedNodeModulesViaProjectLinkDirExists: Test =
    new Test('testHandleSharedNodeModulesViaProjectLinkDir', (ac: AssertionContext) => {

      const projectRoot: Path = Paths.newPath('Z:/mock/current/project', false, true);
      const projectRootPackageJson: Path = Paths.newPath('Z:/mock/current/project/package.json', false, true);
      const cliCtxParams = new CliCtxMockParams();
      cliCtxParams.dir = projectRoot;
      // Setup - single project, directory exists
      const mockCtx: CliCtxMock = new CliCtxMock(cliCtxParams);


      const fscParams = new FsContextMockParams();
      fscParams.ac = ac;
      const sharedDepsProject: Path = Paths.newPath('Z:/mock/current/shared_deps_foo', false, true);
      const sharedDepsNodeModules: Path = Paths.newPath('Z:/mock/current/shared_deps_foo/node_modules', false, true);
      const projectNodeModules: Path = Paths.newPath('node_modules', true, true);
      fscParams.existsAbsResponses = [{ path: projectRoot, response: true },
        { path: sharedDepsProject, response: true },
        { path: sharedDepsNodeModules, response: true },
      ];
      fscParams.existsResponses = [{ relativePathParts: projectNodeModules, inDir: projectRoot, response: false }];
      const packageJson = '{ "sharedNodeModuleProjectSLinks": ["shared_deps_foo"]}';
      fscParams.readJsonResponses = [{ path: projectRootPackageJson, json: packageJson }];
      const mockFsc: FsContextMock = new FsContextMock(fscParams);


      // Create SLinkRunner with mocks
      const runner = new SLinkRunner(mockCtx, mockFsc);
      runner.run();

      // Verify 6 assertions, another 11 assertions are done in the FsContextMock
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


  public static testHandleSharedNodeModulesViaProjectLinkDirMissing: Test = new Test('testHandleSharedNodeModulesViaProjectLinkDirMissing', (ac: AssertionContext) => {

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


  public static testHandleSharedNodeModulesViaProjectLinkMultiDirFirstExists: Test = new Test('testHandleSharedNodeModulesViaProjectLinkMultiDirFirstExists', (ac: AssertionContext) => {
    // Setup - multiple projects, first directory exists
    const mockCtx = new CliCtxMock(true);
    const mockFsCtx = new FsContextMock();

    // Setup mock package.json with multiple project links
    mockFsCtx.mockPackageJson = {
      sharedNodeModuleProjectSLinks: ['first-project', 'second-project']
    };

    // Mock directory structure where first project exists in parent
    mockCtx.dir = Paths.toPath('/mock/current/project', false);
    mockFsCtx.mockExists = true; // First project directory exists

    // Create SLinkRunner with mocks
    const runner = new SLinkRunner(mockCtx as any);
    (runner as any).fsCtx = mockFsCtx;

    // Run the method
    (runner as any).handleSharedNodeModulesViaProjectLinks(['first-project', 'second-project']);

    // Verify
    ac.isTrue(mockFsCtx.existsAbsCalls.length > 0, 'Should check project directories');
    ac.isTrue(mockFsCtx.rmCalls.length > 0, 'Should call rm to remove existing node_modules');
    ac.isTrue(mockFsCtx.slinkCalls.length > 0, 'Should call slink to create symlink for first project');

    const slinkCall = mockFsCtx.slinkCalls[0];
    ac.same('node_modules', slinkCall.slinkName, 'Should create symlink named node_modules');
    ac.isTrue(Paths.toUnix(slinkCall.toDir).includes('/mock/current/first-project/node_modules'),
      'Should link to the first project\'s node_modules path');
  });


  public static testHandleSharedNodeModulesViaProjectLinkMultiDir2ndExists: Test = new Test('testHandleSharedNodeModulesViaProjectLinkMultiDir2ndExists', (ac: AssertionContext) => {
    // Setup - multiple projects, second directory exists (simulate first missing)
    const mockCtx = new CliCtxMock(true);
    const mockFsCtx = new FsContextMock();

    // Setup mock package.json with multiple project links
    mockFsCtx.mockPackageJson = {
      sharedNodeModuleProjectSLinks: ['first-project', 'second-project']
    };

    // Mock directory structure
    mockCtx.dir = Paths.toPath('/mock/current/project', false);

    // Customize existsAbs to return false for first project, true for second
    mockFsCtx.existsAbs = (path: Path) => {
      const pathStr = Paths.toUnix(path);
      mockFsCtx.existsAbsCalls.push(path);

      // Return false for first project, true for second
      if (pathStr.includes('first-project')) {
        return false;
      } else if (pathStr.includes('second-project')) {
        return true;
      }
      return mockFsCtx.mockExists;
    };

    // Create SLinkRunner with mocks
    const runner = new SLinkRunner(mockCtx as any);
    (runner as any).fsCtx = mockFsCtx;

    // Run the method
    (runner as any).handleSharedNodeModulesViaProjectLinks(['first-project', 'second-project']);

    // Verify
    ac.isTrue(mockFsCtx.existsAbsCalls.length >= 2, 'Should check multiple project directories');
    ac.isTrue(mockFsCtx.rmCalls.length > 0, 'Should call rm to remove existing node_modules');
    ac.isTrue(mockFsCtx.slinkCalls.length > 0, 'Should call slink to create symlink for second project');

    const slinkCall = mockFsCtx.slinkCalls[0];
    ac.same('node_modules', slinkCall.slinkName, 'Should create symlink named node_modules');
    ac.isTrue(Paths.toUnix(slinkCall.toDir).includes('/mock/current/second-project/node_modules'),
      'Should link to the second project\'s node_modules path');
  });


  public static testHandleSharedNodeModulesViaProjectLinkMultiDirMissing: Test = new Test('testHandleSharedNodeModulesViaProjectLinkMultiDirMissing', (ac: AssertionContext) => {
    // Setup - multiple projects, none exist
    const mockCtx = new CliCtxMock(true);
    const mockFsCtx = new FsContextMock();

    // Setup mock package.json with multiple project links
    mockFsCtx.mockPackageJson = {
      sharedNodeModuleProjectSLinks: ['first-project', 'second-project']
    };

    // Mock directory structure where no projects exist
    mockCtx.dir = Paths.toPath('/mock/current/project', false);
    mockFsCtx.mockExists = false;

    // Create SLinkRunner with mocks
    const runner = new SLinkRunner(mockCtx as any);
    (runner as any).fsCtx = mockFsCtx;

    // Run the method
    (runner as any).handleSharedNodeModulesViaProjectLinks(['first-project', 'second-project']);

    // Verify
    ac.isTrue(mockFsCtx.existsAbsCalls.length >= 2, 'Should check multiple project directories');
    ac.same(0, mockFsCtx.rmCalls.length, 'Should not call rm since no projects exist');
    ac.same(0, mockFsCtx.slinkCalls.length, 'Should not call slink since no projects exist');
    ac.isTrue(mockCtx.outCalls.some(msg => msg.includes('not found')),
      'Should log that projects were not found');
  });

  constructor() {
    super('SLinkRunnerApiTrial', [
        /* SLinkRunnerApiTrial.testHandleSharedNodeModulesViaEnvVar,
    SLinkRunnerApiTrial.testHandleSharedNodeModulesViaProjectLinks,
    SLinkRunnerApiTrial.testHandleDependencySrcSLinks,
      SLinkRunnerApiTrial.testHandleDependencySLinkGroups,
SLinkRunnerApiTrial.testFullRunWithSharedNodeModulesViaEnvVar,

    */
      SLinkRunnerApiTrial.testHandleSharedNodeModulesViaProjectLinkDirExists,
      SLinkRunnerApiTrial.testHandleSharedNodeModulesViaProjectLinkDirMissing,
      /*

      SLinkRunnerApiTrial.testHandleSharedNodeModulesViaProjectLinkMultiDirFirstExists,
      SLinkRunnerApiTrial.testHandleSharedNodeModulesViaProjectLinkMultiDir2ndExists,
      SLinkRunnerApiTrial.testHandleSharedNodeModulesViaProjectLinkMultiDirMissing
      */
    ]);
  }
}