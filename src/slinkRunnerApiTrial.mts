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
import { CliCtx, CliCtxArg,
    FsContext,
    I_CliCtx,
    I_Fs,
    I_Proc,
    Path,
    Paths,
    SLinkRunner
} from '../../slink.ts.adligo.org/src/slink.mjs';

process.env['RUNNING_TESTS4TS'] = true

class MockCliCtx implements I_CliCtx {
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


    constructor(debug: boolean = false, windows: boolean = false, bash: boolean = false) {
        this.debug = debug;
        this.windows = windows;
        this.bash = bash;
        this.dir = Paths.toParts('/mock/dir', false);
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
    setDir(): void { this.setDirCalls ++; }

    run(cmd: string, args: string[], options?: any, logLevel?: number): any {
        this.runCalls.push({ cmd, args, options, logLevel });
        return { stdout: 'mock output' };
    }

    out(message: string): void {
        this.outCalls.push(message);
    }

    print(message: string): void {
        this.printCalls.push(message);
    }

    logCmd(cmdWithArgs: string, spawnSyncReturns: any, options?: any): void {
        this.logCmdCalls.push({cmdWithArgs, spawnSyncReturns, options})
    }
}


class MockFsContext {
    existsAbsCalls: Path[] = [];
    existsCalls: any[] = [];
    readJsonCalls: Path[] = [];
    rmCalls: any[] = [];
    slinkCalls: any[] = [];
    mkdirTreeCalls: any[] = [];

    mockPackageJson: any = {};
    mockExists: boolean = true;

    existsAbs(path: Path): boolean {
        this.existsAbsCalls.push(path);
        return this.mockExists;
    }

    exists(relativePathParts: Path, inDir: Path): boolean {
        this.existsCalls.push({ relativePathParts, inDir });
        return this.mockExists;
    }

    readJson(path: Path): any {
        this.readJsonCalls.push(path);
        return this.mockPackageJson;
    }

    rm(pathParts: Path, inDir: Path): void {
        this.rmCalls.push({ pathParts, inDir });
    }

    slink(slinkName: string, toDir: Path, inDir: Path): void {
        this.slinkCalls.push({ slinkName, toDir, inDir });
    }

    mkdirTree(dirs: Path, inDir: Path): Path {
        this.mkdirTreeCalls.push({ dirs, inDir });
        return new Path(inDir.getParts().concat(dirs.getParts()), false);
    }
}

/**
 * The tests for SLinkRunnerApiTrial.
 * Note each test is broken out into a static member with the strange lowerCase naming convention for
 * better outlines (Structure) in Eclipse and WebStorm respectively.
 */
export class SLinkRunnerApiTrial extends ApiTrial {
    private static testHandleSharedNodeModulesViaEnvVar: Test = new Test('testHandleSharedNodeModulesViaEnvVar', (ac: AssertionContext) => {
        // Setup
        const mockCtx = new MockCliCtx(true);
        const mockFsCtx = new MockFsContext();

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
    private static testHandleSharedNodeModulesViaProjectLinks: Test = new Test('testHandleSharedNodeModulesViaProjectLinks', (ac: AssertionContext) => {
        // Setup
        const mockCtx = new MockCliCtx(true, true, true);
        const mockFsCtx = new MockFsContext();

        // Setup mock package.json
        mockFsCtx.mockPackageJson = {
            sharedNodeModuleProjectSLinks: ['slink_group_deps.ts.adligo.org']
        };

        // Mock directory structure
        mockCtx.dir = Paths.toParts('/mock/project/current', false);

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
    private static testHandleDependencySrcSLinks: Test = new Test('testHandleDependencySrcSLinks', (ac: AssertionContext) => {
        // Setup
        const mockCtx = new MockCliCtx(true);
        const mockFsCtx = new MockFsContext();

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
    private static testHandleDependencySLinkGroups: Test = new Test('testHandleDependencySLinkGroups', (ac: AssertionContext) => {
        // Setup
        const mockCtx = new MockCliCtx(true);
        const mockFsCtx = new MockFsContext();

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
    private static testFullRunWithSharedNodeModulesViaEnvVar: Test = new Test('testFullRunWithSharedNodeModulesViaEnvVar', (ac: AssertionContext) => {
        // Setup
        const mockCtx = new MockCliCtx(true);
        const mockFsCtx = new MockFsContext();

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
    constructor() {
        super('SLinkRunnerApiTrial', [SLinkRunnerApiTrial.testHandleSharedNodeModulesViaEnvVar,
            SLinkRunnerApiTrial.testHandleSharedNodeModulesViaProjectLinks,
            SLinkRunnerApiTrial.testHandleDependencySrcSLinks,SLinkRunnerApiTrial.testHandleDependencySLinkGroups,
            SLinkRunnerApiTrial.testFullRunWithSharedNodeModulesViaEnvVar
        ]);
    }
}


// Run the trial
const trial = new SLinkRunnerApiTrial();
const suite = new TrialSuite('SLinkRunner Tests', [trial]);
suite.run().printTextReport();