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
} from '../../../../slink.ts.adligo.org/src/slink.mjs';
import * as fs from 'fs';
import { PathOrFileDescriptor } from 'fs';
import { AssertionContext } from "../../../../tests4ts.ts.adligo.org/src/tests4ts.mjs";
import { SpawnSyncOptions, SpawnSyncReturns} from 'child_process';

export class AppendFileData {
  _path: fs.PathOrFileDescriptor;
  _data: string | Uint8Array;
  _options?: fs.WriteFileOptions;

  constructor(path: fs.PathOrFileDescriptor, data: string | Uint8Array, options?: fs.WriteFileOptions) {
    this._path = path;
    this._data = data;
    this._options = options;
  }
}


export class CliCtxLogMock implements I_CliCtxLog {
  _fileNames: string[] = [];
  _messages: string[] = [];

  public log(message: string): void {
    this._messages.push(message);
  }

  public setFileName(fileName: string): void {
    this._fileNames.push(fileName);
  }

  public getFileNames(): string[] {
    return this._fileNames;
  }

  public getMessages(): string[] {
    return this._messages;
  }
}

export class CliCtxMockParams {
  _bash: boolean = true;
  _debug: boolean = true;
  _dir: Path;
  _done: boolean = false;
  _map: Map<string, I_CliCtxFlag> = new Map();
  _proc: ProcMock = new ProcMock();
  _windows: boolean = true;

}

export class CliCtxMock implements I_CliCtx {
  private _bash: boolean;
  private _debug: boolean;
  private _dir: Path;
  private _done: boolean = false;
  private _doneCalls: number = 0;
  private _outCalls: string[] = [];
  private _printCalls: string[] = [];
  private _logCmdCalls: I_LogCmdRequest[] = [];
  private _logCmdCounter = 1;
  private _runCalls: I_RunRequest[] = [];
  private _runCounter = 1;
  private _map: Map<string, I_CliCtxFlag> = new Map();
  private _proc: ProcMock;
  private _setDirCalls: number = 0;
  private _windows: boolean;


  constructor(params: CliCtxMockParams) {
    this._debug = params._debug;
    this._windows = params._windows;
    this._bash = params._bash;
    this._dir = params._dir;
    this._map = params._map;
    this._proc = params._proc;
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

  getDoneCalls(): number { return this._doneCalls;  }
  getOutCalls(): number { return this._outCalls.length; }
  getOutCall(idx: number): string { return this._outCalls[idx]; }
  getPrintCallCount(): number { return this._printCalls.length; }
  getPrintCall(idx: number): string { return this._printCalls[idx]; }
  getLogCmdCallCount(): number { return this._logCmdCalls.length; }
  getLogCmdRequest(idx: number): I_LogCmdRequest { return this._logCmdCalls[idx]; }

  /**
   * calls to run and runE
   */
  getRunCallCount(): number { return this._runCalls.length; }
  /**
   * calls to run and runE
   */
  getRunRequest(idx: number): I_RunRequest { return this._runCalls[idx]; }
  getSetDirCalls(): number { return this._setDirCalls; }

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
    return this._map.get(key) != undefined;
  }
  getProc(): I_Proc {
    return this._proc;
  }

  isDebug(): boolean { return this._debug; }
  isDone(): boolean { this._doneCalls++; return this._done; }
  isWindows(): boolean { return this._windows; }
  isBash(): boolean { return this._bash; }
  getDir(): Path { return this._dir; }
  setDir(): void { this._setDirCalls++; }

  run(cmd: string, args: string[]): any {
    this._runCalls.push({_order: this._runCounter, _cmd: cmd, _args: args});
    this._runCounter++;
    return { stdout: 'mock output' };
  }

  runE(cmd: string, args: string[], options?: SpawnSyncOptions) {
    this._runCalls.push({_order: this._runCounter, _cmd: cmd, _args: args, _options: options});
    this._runCounter++;
    return { stdout: 'mock output' };
  }

  out(message: string): void {
    console.log('out: ' + message);
    this._outCalls.push(message);
  }

  print(message: string): void {
    console.log('print: ' + message);
    this._printCalls.push(message);
  }

  logCmd(cmdWithArgs: string, spawnSyncReturns: any, options?: any): void {
    this._logCmdCalls.push({_order: this._logCmdCounter, _cmdWithArgs: cmdWithArgs, _spawnSyncReturns: spawnSyncReturns, _options: options })
    this._logCmdCounter++;
  }
}

export class FsMockParams {
  _ac: AssertionContext;
  _fileReadResponses?: Map<ReadFileRequest, string>;
}

export class FsMock implements I_Fs {
  _ac: AssertionContext;
  _appends: AppendFileData[] = [];
  _copyFileSyncRequests: I_CopyFileSyncRequest[] = [];
  _copyFileSyncCounter = 1;
  /**
   * This key is the JSON.stringify( of the ReadFileData)
   */
  _fileReadResponses: Map<string, string>;
  _fileReadRequests: ReadFileRequest[] = [];
  _getSymlinkTargetResponses: Map<string, string>;

  constructor(params: FsMockParams) {
    this._ac = params._ac;
    this._fileReadResponses = new Map();
    if (params != undefined) {

      if (params._fileReadResponses != undefined) {
        for (const [key, value] of Object.entries(params._fileReadResponses)) {
          this._fileReadResponses.set(JSON.stringify(key), value);
        }
      }
    }
  }

  _copyFileSync(src: PathOrFileDescriptor, dest: PathOrFileDescriptor): void {
    throw new Error('Method not implemented.');
  }
  getSymlinkTarget(path: string): string {
    throw new Error('Method not implemented.');
  }

  appendFileSync(
    path: fs.PathOrFileDescriptor,
    data: string | Uint8Array,
    options?: fs.WriteFileOptions,
  ): void {
    this._appends.push(new AppendFileData(path, data, options))
  }


  /**
   * @see {@link I_Fs#_copyFileSync}
   */
  public copyFileSync(src: PathOrFileDescriptor, dest: PathOrFileDescriptor, mode?: number): void {
    this._copyFileSyncRequests.push({_order: this._copyFileSyncCounter, _src: src, _dest: dest, _mode: mode });
    this._copyFileSyncCounter++;
  }

  /*
  doesn't work hmm fell back to bash commands for this
  existsSync(
      path: fs.PathLike,
  ): boolean {
    return fs.existsSync(path);
  }
   */

  /**
   * @see {@link I_Fs#getSymlinkTargetRelative}
   */
  getSymlinkTargetRelative(relativePath: string, parentPath: string, pathSeperator: string): string {
    let r = fs.realpathSync(parentPath + pathSeperator + relativePath);
    if (r.length < parentPath.length) {
      throw new Error('The following absolute path;\n\t' + r + '\n does not appear to be under\n\t' + parentPath);
    }
    return r.substring(parentPath.length + 1, r.length);
  }

  isSymlink(path: string): boolean {
    //TODO 
    return false;
  }

  readFileSync(path: PathOrFileDescriptor, options?: {
    encoding?: null | undefined;
    flag?: string | undefined;
  } | null): string | undefined {
    let pathString: string = path.toString();
    this._fileReadRequests.push(new ReadFileRequest(pathString, options))
    let r = this._fileReadResponses.get(pathString);
    this._ac.isTrue(r != undefined, "The readFileSync method is not aware of ");
    return r;
  }
}


export class FsContextMockParams {
  _ac: AssertionContext;
  _existsAbsResponses: I_ExistsAbsResponse[] = [];
  _existsResponses: I_ExistsResponse[] = [];
  _fsMock: FsMock;
  _readJsonResponses: I_ReadJsonResponse[] = [];
}

export class FsContextMock implements I_FsContext {
  private _ac: AssertionContext;
  private _ordnalCounter: number = 0;
  private _existsAbsCounter: number = 0;
  private _existsAbsCalls: any[] = [];
  private _existsAbsResponses: I_ExistsAbsResponse[];
  private _existsCalls: any[] = [];
  private _existsCounter: number = 0;
  private _existsResponses: any[];
  private _fsMock: FsMock;
  private _mkDirCalls: I_MkdirRequest[] = [];
  private _readCalls: any[] = [];
  private _readJsonCalls: any[] = [];
  private _readJsonCounter: number = 0;
  private _readJsonResponses: I_ReadJsonResponse[];
  private _rmCalls: I_RmRequest[] = [];
  private _slinkCalls: I_SlinkRequest[] = [];
  private _mkdirTreeCalls: any[] = [];

  mockPackageJson: any = {};

  constructor(params: FsContextMockParams) {
    if (params._ac != undefined) {
      this._ac = params._ac;
    } else {
      throw new Error('Invalid ac');
    }
    this._existsAbsResponses = params._existsAbsResponses;
    this._existsResponses = params._existsResponses;
    this._fsMock = params._fsMock;
    this._readJsonResponses = params._readJsonResponses;
  }

  getExistsAbsCalls(): number { return this._existsAbsCalls.length; }
  getExistsCalls(): number { return this._existsCalls.length; }
  getRmCalls(): number { return  this._rmCalls.length; }
  getSlinkCalls(): number { return this._slinkCalls.length; }
  getSlinkCall(idx: number ): I_SlinkRequest { return this._slinkCalls[idx]; }

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
    this._existsAbsCalls.push({ order: this._ordnalCounter++, path: path });
    this._ac.isTrue(this._existsAbsCounter < this._existsAbsResponses.length,
      "No more existsAbs responses!");
    let r = this._existsAbsResponses[this._existsAbsCounter];
    this._existsAbsCounter++;
    let actual = path.toString();
    let expected = r._path.toString();
    this._ac.equals(expected, actual, "Paths should match expected");
    return r._response;
  }

  exists(fileOrDir: string, inDir: Path): boolean {
    this._existsCalls.push({ order: this._ordnalCounter++, fileOrDir: fileOrDir, inDir: inDir });
    this._ac.isTrue(this._existsCounter < this._existsResponses.length,
      "No more exists responses!");
    let r = this._existsResponses[this._existsCounter++];
    this._ac.equals(r.fileOrDir, fileOrDir, "fileOrDir path parts should match");
    this._ac.equals(r.inDir.toString(), inDir.toString(), "Relative path parts inDir should match");
    return r.response;
  }

  getFs(): I_Fs {
    return this._fsMock;
  }
  mkdir(dir: string, inDir: Path): void {
    this._mkDirCalls.push({ _order: this._ordnalCounter++, _dir: dir, _inDir: inDir });
  }
  read(path: Path, charset?: string) {
    this._readCalls.push({ _order: this._ordnalCounter++, _dir: path, _charset: charset });
  }

  readJson(path: Path): any {
    this._readJsonCalls.push({ order: this._ordnalCounter++, path: path });
    this._ac.isTrue(this._readJsonCounter < this._readJsonResponses.length,
      "No more read json responses!");
    let r = this._readJsonResponses[this._readJsonCounter++];
    this._ac.equals(r._path.toString(), path.toString(), "Read Json paths should match");
    return JSON.parse(r._json);
  }

  rm(dir: string, inDir: Path): void {
    this._rmCalls.push({ _order: this._ordnalCounter++, _dir: dir, _inDir: inDir });
  }

  slink(slinkName: string, toDir: Path, inDir: Path): void {
    this._slinkCalls.push({ _order: this._ordnalCounter++, _slinkName: slinkName, _toDir: toDir, _inDir: inDir });
  }

  mkdirTree(dirs: Path, inDir: Path): Path {
    this._mkdirTreeCalls.push({ order: this._ordnalCounter++, dirs: dirs, inDir: inDir });
    return new Path(inDir.getParts().concat(dirs.getParts()), false);
  }
}

export interface I_CopyFileSyncRequest {
  /**
   * _order is the order of the request 1,2,3 etc
   */
  _order: number;
  _src: PathOrFileDescriptor;
  _dest: PathOrFileDescriptor;
  _mode?: number;
}

export interface I_ExistsAbsResponse {
  /**
   * _order is the order of the request 1,2,3 etc
   */
  _order: number;
  _path: Path;
  _response: boolean;
}

export interface I_ExistsResponse {
  /**
   * _order is the order of the request 1,2,3 etc
   */
  _order: number;
  _fileOrDir: string;
  _inDir: Path;
  _response: boolean;
}

/**
 * caputres cals to the {@link CliCtx#logCmd} method
 */
export interface I_LogCmdRequest {
  /**
   * _order is the order of the request 1,2,3 etc
   */
  _order: number;
  _cmdWithArgs: string;
  _spawnSyncReturns: SpawnSyncReturns<string | Buffer<ArrayBufferLike>>;
  _options?: SpawnSyncOptions;
}

export interface I_ReadJsonResponse {
  _path: Path;
  _json: string;
}

/**
 * captures calls to {@link I_FsContext#rm}
 */
export interface I_MkdirRequest {
  /**
   * _order is the order of the request 1,2,3 etc
   */
  _order: number;
  _dir: string;
  _inDir: Path;
}

/**
 * captures calls to {@link I_FsContext#rm}
 */
export interface I_RmRequest {
  /**
   * _order is the order of the request 1,2,3 etc
   */
  _order: number;
  _dir: string;
  _inDir: Path;
}

/**
 * captures the parameters to the {@link I_CliCtx#run} and {@link CliCtx#runE} methods
 */
export interface I_RunRequest {
  /**
   * _order is the order of the request 1,2,3 etc
   */
  _order: number;
  _cmd: string;
  _args: string[];
  _options?: SpawnSyncOptions;
}

/**
 * captures the parameters to the {@link I_FsContext#slink} method
 */
export interface I_SlinkRequest {
  /**
   * _order is the order of the request 1,2,3 etc
   */
  _order: number;
  _slinkName: string;
  _toDir: Path;
  _inDir: Path;
}

export class ProcMock implements I_Proc {
  public static DEFAULT_ARGV_1 = '/apps/node.exe';
  public static DEFAULT_ARGV_2 = '/apps/npm/node_modules/@ts.adligo.org/slink/dist/slink.mjs';
  public static DEFAULT_ARGV: string[] = [ProcMock.DEFAULT_ARGV_1, ProcMock.DEFAULT_ARGV_2];
  public static DEFAULT_CWD = '/home/jd/foo';

  _argv: string[];
  _cwd: string;
  _env: Map<string, string>;
  _errorMessages: string[] = [];
  _exit: number;
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
    if (windows != undefined) {
      this._windows = windows;
    } else {
      this._windows = false;
    }
  }

  copyFileSync(src: fs.PathOrFileDescriptor, dest: fs.PathOrFileDescriptor): void {

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

  exit(code: number) {
    this._exit = code;
  }

  envVar(key: string): string {
    return this._env[key];
  }

  error(message: string) {
    this._errorMessages.push(message);
  }

  isWindows() {
    return this._windows;
  }

  shell(): string {
    return this._shell;
  }

}

export class ReadFileRequest {
  private readonly _path: string;
  private readonly _options?: {
    encoding?: null | undefined;
    flag?: string | undefined;
  } | null;

  constructor(path: string, options?: {
    encoding?: null | undefined;
    flag?: string | undefined;
  } | null) {
    this._path = path;
    this._options = options;
  }
  public getPath(): string { return this._path; }
  public getOptions(): {
    encoding?: null | undefined;
    flag?: string | undefined;
  } | null { return this._options; }
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


