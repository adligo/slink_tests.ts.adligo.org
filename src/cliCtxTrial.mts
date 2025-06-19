// slink_tests.ts.adligo.org/src/pathsTest.ts


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

import { I_AssertionContext, I_Test } from '../../i_tests4ts.ts.adligo.org/src/i_tests4ts.mjs';
import { ApiTrial } from '../../tests4ts.ts.adligo.org/src/trials.mjs';
import { Test, TestParams } from '../../tests4ts.ts.adligo.org/src/tests.mjs';
import {
  CliCtx,
  FLAGS,
  I_SlinkConsole,
  I_CliCtxLog,
  Path,
  Paths,
  FsContext,
  VERSION_NBR, CliCtxArg
} from '../../slink.ts.adligo.org/src/slink.mjs';
import { SlinkConsoleMock, ProcMock, CliCtxLogMock, FsMock, FsMockParams } from './etc/mocks/mocks.mjs';


export class CliCtxTrial extends ApiTrial {
  public static readonly TESTS: I_Test[] = [
    new Test('testConstructionWithDDebugFlag', (ac: I_AssertionContext) => {
      console.log("ac is " + typeof (ac.equals));
      let consoleMock: SlinkConsoleMock = new SlinkConsoleMock();
      let cliCtxLogMock: CliCtxLogMock = new CliCtxLogMock();
      let fsParams = new FsMockParams();
      fsParams._ac = ac;
      let fsMock: FsMock = new FsMock(fsParams);
      let procMock: ProcMock = new ProcMock();
      let args = [ProcMock.DEFAULT_ARGV_1, ProcMock.DEFAULT_ARGV_2, '--debug'];
      let cliCtx = new CliCtx(FLAGS, args, cliCtxLogMock, consoleMock, fsMock, procMock);
      //assert innner state
      let keys: string[] = cliCtx.getKeys();
      ac.equals(1, keys.length, "Debug should be the only key!");
      ac.equals('debug', keys[0], "Debug should be the only key!");
      ac.isTrue(consoleMock.messages.length >= 1, "There should be a multiple message printed to the console");
      ac.equals("Debug is enabled!", consoleMock.messages[0], "Debug should be enabled should be " +
        "the first debug message printed on the console.");
      ac.isTrue(cliCtx.isDone() == false, "The CliCtx should not be done yet.");
    }),
    new Test('testConstructionWithDDFlag', (ac: I_AssertionContext) => {
      console.log("ac is " + typeof (ac.equals));
      let consoleMock: SlinkConsoleMock = new SlinkConsoleMock();
      let cliCtxLogMock: CliCtxLogMock = new CliCtxLogMock();
      let fsParams = new FsMockParams();
      fsParams._ac = ac;
      let fsMock: FsMock = new FsMock(fsParams);
      let procMock: ProcMock = new ProcMock();
      let args = [ProcMock.DEFAULT_ARGV_1, ProcMock.DEFAULT_ARGV_2, '-d'];
      let cliCtx = new CliCtx(FLAGS, args, cliCtxLogMock, consoleMock, fsMock, procMock);
      //assert innner state
      let keys: string[] = cliCtx.getKeys();
      ac.equals(1, keys.length, "Debug should be the only key!");
      ac.equals('debug', keys[0], "Debug should be the only key!");
      ac.isTrue(consoleMock.messages.length >= 1, "There should be a multiple message printed to the console");
      ac.equals("Debug is enabled!", consoleMock.messages[0], "Debug should be enabled should be " +
        "the first debug message printed on the console.");
      ac.isTrue(cliCtx.isDone() == false, "The CliCtx should not be done yet.");
    }),
    new Test('testConstructionWithDDHelpFlag', (ac: I_AssertionContext) => {
      console.log("ac is " + typeof (ac.equals));
      let consoleMock: SlinkConsoleMock = new SlinkConsoleMock();
      let cliCtxLogMock: CliCtxLogMock = new CliCtxLogMock();
      let fsParams = new FsMockParams();
      fsParams._ac = ac;
      let fsMock: FsMock = new FsMock(fsParams);
      let procMock: ProcMock = new ProcMock();
      let args = [ProcMock.DEFAULT_ARGV_1, ProcMock.DEFAULT_ARGV_2, '--help'];
      let cliCtx = new CliCtx(FLAGS, args, cliCtxLogMock, consoleMock, fsMock, procMock);
      //assert innner state
      let keys: string[] = cliCtx.getKeys();
      ac.equals(1, keys.length, "Debug should be the only key!");
      ac.equals('help', keys[0], "Debug should be the only key!");
      ac.isTrue(consoleMock.messages.length >= 1, "There should be a multiple message printed to the console");

      ac.equals("This program understands the following commands;\n", consoleMock.messages[0], "Help should print a lot of stuff.");
      ac.equals(17, consoleMock.messages.length, "Help prints a lot");
      ac.isTrue(cliCtx.isDone() == true, "The CliCtx should be done, at this point.");
    }),
    new Test('testConstructionWithDHFlag', (ac: I_AssertionContext) => {
      console.log("ac is " + typeof (ac.equals));
      let consoleMock: SlinkConsoleMock = new SlinkConsoleMock();
      let cliCtxLogMock: CliCtxLogMock = new CliCtxLogMock();
      let fsParams = new FsMockParams();
      fsParams._ac = ac;
      let fsMock: FsMock = new FsMock(fsParams);
      let procMock: ProcMock = new ProcMock();
      let args = [ProcMock.DEFAULT_ARGV_1, ProcMock.DEFAULT_ARGV_2, '-h'];
      let cliCtx = new CliCtx(FLAGS, args, cliCtxLogMock, consoleMock, fsMock, procMock);
      //assert innner state
      let keys: string[] = cliCtx.getKeys();
      ac.equals(1, keys.length, "Debug should be the only key!");
      ac.equals('help', keys[0], "Debug should be the only key!");
      ac.isTrue(consoleMock.messages.length >= 1, "There should be a multiple message printed to the console");

      ac.equals("This program understands the following commands;\n", consoleMock.messages[0], "Help should print a lot of stuff.");
      ac.equals(17, consoleMock.messages.length, "Help prints a lot");
      ac.isTrue(cliCtx.isDone() == true, "The CliCtx should be done, at this point.");
    }),
    new Test('testConstructionWithDDLogFlag', (ac: I_AssertionContext) => {
      console.log("ac is " + typeof (ac.equals));
      let consoleMock: SlinkConsoleMock = new SlinkConsoleMock();
      let cliCtxLogMock: CliCtxLogMock = new CliCtxLogMock();
      let fsParams = new FsMockParams();
      fsParams._ac = ac;
      let fsMock: FsMock = new FsMock(fsParams);
      let procMock: ProcMock = new ProcMock();
      let args = [ProcMock.DEFAULT_ARGV_1, ProcMock.DEFAULT_ARGV_2, '--log', 'foo/file.txt'];
      let cliCtx = new CliCtx(FLAGS, args, cliCtxLogMock, consoleMock, fsMock, procMock);
      //assert innner state
      let keys: string[] = cliCtx.getKeys();
      ac.equals(1, keys.length, "Log should be the only key!");
      ac.equals('log', keys[0], "Log should be the only key!");
      let val: CliCtxArg = cliCtx.getValue('log');
      ac.equals('foo/file.txt', val.getArg(), "The output log file name should be set, to foo/file.txt");
      ac.isTrue(cliCtx.isDone() == false, "The CliCtx should not be done at this point.");
    }),
    new Test('testConstructionWithDLogFlag', (ac: I_AssertionContext) => {
      console.log("ac is " + typeof (ac.equals));
      let consoleMock: SlinkConsoleMock = new SlinkConsoleMock();
      let cliCtxLogMock: CliCtxLogMock = new CliCtxLogMock();
      let fsParams = new FsMockParams();
      fsParams._ac = ac;
      let fsMock: FsMock = new FsMock(fsParams);
      let procMock: ProcMock = new ProcMock();
      let args = [ProcMock.DEFAULT_ARGV_1, ProcMock.DEFAULT_ARGV_2, '-l', 'foo/file.txt'];
      let cliCtx = new CliCtx(FLAGS, args, cliCtxLogMock, consoleMock, fsMock, procMock);
      //assert innner state
      let keys: string[] = cliCtx.getKeys();
      ac.equals(1, keys.length, "Log should be the only key!");
      ac.equals('log', keys[0], "Log should be the only key!");
      let val: CliCtxArg = cliCtx.getValue('log');
      ac.equals('foo/file.txt', val.getArg(), "The output log file name should be set, to foo/file.txt");
      ac.isTrue(cliCtx.isDone() == false, "The CliCtx should not be done at this point.");
    }),
    new Test('testConstructionWithDDVersionFlag', (ac: I_AssertionContext) => {
      console.log("ac is " + typeof (ac.equals));
      let consoleMock: SlinkConsoleMock = new SlinkConsoleMock();
      let cliCtxLogMock: CliCtxLogMock = new CliCtxLogMock();
      let fsParams = new FsMockParams();
      fsParams._ac = ac;
      let fsMock: FsMock = new FsMock(fsParams);
      let procMock: ProcMock = new ProcMock();
      let args = [ProcMock.DEFAULT_ARGV_1, ProcMock.DEFAULT_ARGV_2, '--version'];
      let cliCtx = new CliCtx(FLAGS, args, cliCtxLogMock, consoleMock, fsMock, procMock);
      //assert innner state
      let keys: string[] = cliCtx.getKeys();
      ac.equals(1, keys.length, "Version should be the only key!");
      ac.equals('version', keys[0], "Version should be the only key!");
      ac.equals(1, consoleMock.messages.length, "There should be a single message printed to the console");
      ac.equals(VERSION_NBR, consoleMock.messages[0], "Only the Version Number should be printed!");
      ac.isTrue(cliCtx.isDone() == true, "The CliCtx should be done at this point.");
    }),
    new Test('testConstructionWithDVFlag', (ac: I_AssertionContext) => {
      console.log("ac is " + typeof (ac.equals));
      let consoleMock: SlinkConsoleMock = new SlinkConsoleMock();
      let cliCtxLogMock: CliCtxLogMock = new CliCtxLogMock();
      let fsParams = new FsMockParams();
      fsParams._ac = ac;
      let fsMock: FsMock = new FsMock(fsParams);
      let procMock: ProcMock = new ProcMock();
      let args = [ProcMock.DEFAULT_ARGV_1, ProcMock.DEFAULT_ARGV_2, '-v'];
      let cliCtx = new CliCtx(FLAGS, args, cliCtxLogMock, consoleMock, fsMock, procMock);

      //assert innner state
      let keys: string[] = cliCtx.getKeys();
      ac.equals(1, keys.length, "Version should be the only key!");
      ac.equals('version', keys[0], "Version should be the only key!");
      ac.equals(1, consoleMock.messages.length, "There should be a single message printed to the console");
      ac.equals(VERSION_NBR, consoleMock.messages[0], "Only the Version Number should be printed!");
      ac.isTrue(cliCtx.isDone() == true, "The CliCtx should be done at this point.");
    }),
  ];
  constructor() {
    super('org.adligo.ts.slink_tests.CliCtxTrial', CliCtxTrial.TESTS);
  }
}
