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


import { I_Proc, I_SlinkConsole, I_CliCtxLog, I_Fs } from '../../slink.ts.adligo.org/src/slink.mjs';
import fs from "fs";
import * as fs from "node:fs";
import * as fs from "node:fs";
import * as fs from "node:fs";
import * as fs from "node:fs";
import * as fs from "node:fs";
import * as fs from "node:fs";
import {FileReadOptions} from "node:fs/promises";

export class ProcMock implements I_Proc {
    public static DEFAULT_ARGV_1 = '/apps/node.exe';
    public static DEFAULT_ARGV_2 = '/apps/npm/node_modules/@ts.adligo.org/slink/dist/slink.mjs';
    public static DEFAULT_ARGV: string[] = [ProcMock.DEFAULT_ARGV_1,ProcMock.DEFAULT_ARGV_2];
    public static DEFAULT_CWD = '/home/jd/foo';

    argvM: string[];
    cwdM: string;
    envM: Map<string, string>;
    shellM: string;

    constructor(argv?: string[], cwd?: string, env?: Map<string, string>, shell?: string) {
        if (argv == undefined) {
            this.argvM = ProcMock.DEFAULT_ARGV;
        } else {
            this.argvM = argv;
        }
        if (cwd == undefined) {
            this.cwdM = ProcMock.DEFAULT_CWD;
        } else {
            this.cwdM = cwd;
        }
        if (env == undefined) {
            this.envM = new Map();
        } else {
            this.envM = env;
        }
        //note the shell is undefined a lot, so if this is undefined that's ok
        this.shellM = shell;
    }

    argv(): string[] {
        return this.argvM
    }

    cwd(): string {
        return this.cwdM;
    }

    /**
     * no code should depend on this, it's mostly for debugging to the console
     */
    env(): any {
        return { envIsHugeToHuge: "values" };
    }

    envVar(key: string): string {
        return this.envM[key];
    }

    shell(): string {
        return this.shellM;
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

export class CliCtxLogMock implements  I_CliCtxLog {
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

export class AppendFileData {
    path: fs.PathOrFileDescriptor;
    data: string | Uint8Array;
    options?: fs.WriteFileOptions;

    constructor(path: fs.PathOrFileDescriptor,  data: string | Uint8Array,  options?: fs.WriteFileOptions) {
        this.path = path;
        this.data = data;
        this.options = options;
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