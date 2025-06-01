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


import {
    I_Proc,
    I_SlinkConsole,
    I_CliCtxLog,
    I_Fs,
    Path,
    I_CliCtxFlag,
    I_CliCtx, CliCtxArg, I_FsContext,
    ShellOptionsFactory
} from '../../slink.ts.adligo.org/src/slink.mjs';
import fs from "fs";
import * as fs from "node:fs";
import {FileReadOptions} from "node:fs/promises";
import {AssertionContext} from "../../tests4ts.ts.adligo.org/src/tests4ts.mjs";


export class AppendFileData {
    path: fs.PathOrFileDescriptor;
    data: string | Uint8Array;
    options?: fs.WriteFileOptions;

    constructor(path: fs.PathOrFileDescriptor, data: string | Uint8Array, options?: fs.WriteFileOptions) {
        this.path = path;
        this.data = data;
        this.options = options;
    }
}


export class CliCtxLogMock implements I_CliCtxLog {
    fileNames: string[] = [];
    messages: string[] = [];

    public log(message: string): void {
        this.messages.push(message);
    }

    public setFileName(fileName: string): void {
        this.fileNames.push(fileName);
    }

    public getFileNames(): string[] {
        return this.fileNames;
    }

    public getMessages(): string[] {
        return this.messages;
    }
}

export class CliCtxMockParams {
    bash: boolean = true;
    debug: boolean = true;
    dir: Path;
    done: boolean = false;
    map: Map<string, I_CliCtxFlag> = new Map();
    proc: ProcMock = new ProcMock();
    windows: boolean = true;

}

export class CliCtxMock implements I_CliCtx {
    bash: boolean;
    debug: boolean;
    dir: Path;
    done: boolean = false;
    doneCalls: number = 0;
    outCalls: string[] = [];
    printCalls: string[] = [];
    logCmdCalls: any[] = [];
    runCalls: any[] = [];
    map: Map<string, I_CliCtxFlag> = new Map();
    proc: ProcMock;
    setDirCalls: number = 0;
    windows: boolean;


    constructor(params: CliCtxMockParams) {
        this.debug = params.debug;
        this.windows = params.windows;
        this.bash = params.bash;
        this.dir = params.dir;
        this.map = params.map;
        this.proc = params.proc;
    }

    envVar(name: string): string {
        throw new Error('Method not implemented.');
    }
    getShell(): string {
        throw new Error('Method not implemented.');
    }
    getShellOptionsFactory(): ShellOptionsFactory {
        throw new Error('Method not implemented.');
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
        return this.map.get(key) != undefined;
    }
    getProc(): I_Proc {
        return this.proc;
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

    runE(cmd: string, args: string[], options?: any, logLevel?: number) {
        throw new Error('Method not implemented.');
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


export class FsMock implements I_Fs {
    appends: AppendFileData[] = [];
    fileReads: ReadFileData[] = [];
    fileReadResponses: Map<string,string>;

    constructor(fileReadResponses?: Map<string,string>) {
        if (fileReadResponses != undefined) {
            this.fileReadResponses = fileReadResponses;
        } else {
            this.fileReadResponses = new Map();
        }
    }

    appendFileSync(
        path: fs.PathOrFileDescriptor,
        data: string | Uint8Array,
        options?: fs.WriteFileOptions,
    ): void {
        this.appends.push(new AppendFileData(path,data, options))
    }

    readFileSync(path: fs.PathOrFileDescriptor, options?: ReadFileOptions | null): string | undefined {
        let pathString: string = path.toString();
        this.fileReads.push(new ReadFileData(path, options))
        return this.fileReads.get(pathString);
    }
}


export class FsContextMockParams {
    ac: AssertionContext;
    existsAbsResponses: I_ExistsAbsResponse[] = [];
    existsResponses: I_ExistsResponse[] = [];
    readJsonResponses: I_ReadJsonResponse[] = [];
}

export class FsContextMock implements I_FsContext {
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

    getSymlinkTarget(dir: Path): Path {
        throw new Error('Method not implemented.');
    }
    isSymlink(dir: Path): boolean {
        throw new Error('Method not implemented.');
    }
    getSymlinkTargetRelative(relativePath: Path, parentPath: Path): Path {
        throw new Error('Method not implemented.');
    }
    rd(dir: string, inDir: Path): void {
        throw new Error('Method not implemented.');
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


export interface I_ExistsAbsResponse {
    path: Path;
    response: boolean;
}

export interface I_ExistsResponse {
    relativePathParts: Path;
    inDir: Path;
    response: boolean;
}

export interface I_ReadJsonResponse {
    path: Path;
    json: string;
}


export class ProcMock implements I_Proc {
    public static DEFAULT_ARGV_1 = '/apps/node.exe';
    public static DEFAULT_ARGV_2 = '/apps/npm/node_modules/@ts.adligo.org/slink/dist/slink.mjs';
    public static DEFAULT_ARGV: string[] = [ProcMock.DEFAULT_ARGV_1,ProcMock.DEFAULT_ARGV_2];
    public static DEFAULT_CWD = '/home/jd/foo';

    _argv: string[];
    _cwd: string;
    _env: Map<string, string>;
    _shell: string;
    _windows: boolean;

    constructor(argv?: string[], cwd?: string, env?: Map<string, string>, shell?: string, windows?: boolean) {
        if (argv == undefined) {
            this._argv = ProcMock.DEFAULT_ARGV;
        } else {
            this._argv = argv;
        }
        if (cwd == undefined) {
            this._cwd = ProcMock.DEFAULT_CWD;
        } else {
            this._cwd = cwd;
        }
        if (env == undefined) {
            this._env = new Map();
        } else {
            this._env = env;
        }
        //note the shell is undefined a lot, so if this is undefined that's ok
        this._shell = shell;
        if (windows  != undefined) {
            this._windows = windows;
        } else {
            this._windows = false;
        }
    }

    getPathSeperator(): string {
       if (this._windows) {
           return '\\';
       }
       return '/';
    }

    argv(): string[] {
        return this._argv
    }

    cwd(): string {
        return this._cwd;
    }

    /**
     * no code should depend on this, it's mostly for debugging to the console
     */
    env(): any {
        return { envIsHugeToHuge: "values" };
    }

    envVar(key: string): string {
        return this._env[key];
    }

    isWindows() {
        return this._windows;
    }

    shell(): string {
        return this._shell;
    }

}

export class ReadFileOptions {
    encoding?: null | undefined;
    flag?: string | undefined;

    constructor(encoding?: null | undefined, flag?: string | undefined) {
        this.encoding = encoding;;
        this.flag = flag;
    }

}

export class ReadFileData {
    path: fs.PathOrFileDescriptor;
    options?: ReadFileOptions | null;

    constructor(path: fs.PathOrFileDescriptor, options?: ReadFileOptions | null) {
       this.path = path;
       this.options = options;
    }

}

export class SlinkConsoleMock implements I_SlinkConsole {
    messages: string[] = [];

    public out(message: string): void {
        this.messages.push(message);
    }

    public getMessages(): string[] {
        return this.messages;
    }
}


