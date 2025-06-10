/**
 * This is a manual trial that should be run only be developers on their machines, not on the build server.
 * When running / debugging this from WebStorm you will want to setup the following environment variables;
 * RUNNING_TESTS4TS=true
 * SHELL=C:\some\path\Git\bin\bash.exe
 *
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
import { I_AssertionContext } from '../../i_tests4ts.ts.adligo.org/src/i_tests4ts.mjs';
import { ApiTrial } from '../../tests4ts.ts.adligo.org/src/trials.mjs';
import { Test, TestParams } from '../../tests4ts.ts.adligo.org/src/tests4ts.mjs';
import { JUnitXmlGenerator } from '../../junit-xml-tests4j.ts.adligo.org/src/junitXmlTests4jGenerator.mjs';
import {CliCtx, FsContext, Path, Paths, ShellRunner, FLAGS, FsStub} from '../../slink.ts.adligo.org/src/slink.mjs';

console.log("process.argv is; \n\t" + process.argv);
console.log("process.env.SHELL is; \n\t" + process.env.SHELL);
if (process.env.SHELL == undefined) {
    throw new Error("A Shell is required, please setup your environment variables.");
}
const ctx: CliCtx = new CliCtx(FLAGS, process.argv.concat('--debug'));
const fsc: FsContext = new FsContext(ctx);

function getCwd(): string {
    if (process.env.CWD == undefined) {
        return process.cwd();
    }
    return process.env.CWD;
}
const cwd = getCwd();
console.log("runDir is; \n\t" + cwd);
let pCwd : Path = Paths.toPath(cwd, false);

export class FxContextManualApiTrial extends ApiTrial {
    public static testExistsAbs: Test = new Test(TestParams.of('testExistsAbs'), 
    (ac: I_AssertionContext) => {
        console.log('pCwd is ' + pCwd.toPathString());
        let td: Path = pCwd.child('test_data');
        ac.isTrue(fsc.existsAbs(td),
            "The test_data should show as existAbs");
        ac.isTrue(fsc.existsAbs(new Path(pCwd.getParts().concat('test_data','foo'), false)),
            "The test_data/foo should show as existAbs");
        ac.isTrue(fsc.existsAbs(new Path(pCwd.getParts().concat('test_data','package.json'), false)),
            "The test_data/package.json should show as existAbs");

        ac.isFalse(fsc.existsAbs(new Path(pCwd.getParts().concat('test_data3'), false)),
            "The test_data3 should show as existAbs = false");
        ac.isFalse(fsc.existsAbs(new Path(pCwd.getParts().concat('test_data','foo1'), false)),
            "The test_data/foo1 should show as existAbs = false");
        ac.isFalse(fsc.existsAbs(new Path(pCwd.getParts().concat('test_data','package2.json'), false)),
            "The test_data/package2.json should show as existAbs = false");
    });
    public static testExists: Test = new Test(TestParams.of('testExists'), (ac: I_AssertionContext) => {
        ac.isTrue(fsc.exists('test_data', pCwd),
            "The test_data should show as exist");
        ac.isTrue(fsc.exists('foo', pCwd.child('test_data')),
            "The test_data/foo should show as exist");
        ac.isTrue(fsc.exists('package.json', pCwd.child('test_data')),
            "The test_data/package.json should show as exist");

        ac.isFalse(fsc.exists('test_data2', pCwd),
            "The test_data2 should show as exist");
        ac.isFalse(fsc.exists('test_data', pCwd.child('foo3')),
            "The test_data/foo3 should show as exist");
        ac.isFalse(fsc.exists('package4.json', pCwd.child('test_data')),
            "The test_data/package4.json should show as exist");
    });
    /**
     * Note: This test is basically impossible to debug on Windows due to the need to
     * be a user like Administrator on Windows to create Symlinks
     */
    public static testMkSymlink: Test = new Test(TestParams.of('testMkSymlink'), 
    (ac: I_AssertionContext) => {
        ac.isTrue(fsc.exists('test_data', pCwd),
            "The test_data should show as exist");
        let td = pCwd.child('test_data');
        let foo = td.child('foo');
        let g = foo.child('bar').child('g');
        let fbg = foo.child('fbg');
        if (fsc.existsAbs(fbg)) {
            if (ctx.isWindows()) {
                fsc.rd(fbg.toWindows(), td);
            } else {
                fsc.rm(fbg.toUnix(), td);
            }
        }
        if (fsc.existsAbs(fbg)) {
            ac.isTrue(false, 'The test_data/fbg should not exist');
        }
        fsc.slink('fbg', g, foo);

        ac.isTrue(fsc.isSymlink(fbg), "A symlink should show as exist at ./test_data/fbg");
        let rFbg = new Path(['test_data', 'foo','fbg'], true);
        console.log('rFbg is ' + rFbg.toPathString());
        console.log('pCwd is ' + pCwd.toPathString());
        let rel: Path = fsc.getSymlinkTargetRelative(rFbg, pCwd)
        ac.equals(4, rel.getParts().length, "The symlink at ./test_data/fbg should target ./test_data/foo/bar/g")
        ac.equals('test_data',  rel.getParts()[0], "The symlink at ./test_data/fbg should target ./test_data/foo/bar/g")
        ac.equals('foo', rel.getParts()[1], "The symlink at ./test_data/fbg should target ./test_data/foo/bar/g")
        ac.equals('bar', rel.getParts()[2], "The symlink at ./test_data/fbg should target ./test_data/foo/bar/g")
        ac.equals('g', rel.getParts()[3], "The symlink at ./test_data/fbg should target ./test_data/foo/bar/g")

        // manual cleanup consists of something like;
        // $ echo 'rd .\test_data\foo\fbg' | cmd

        let cleanup: boolean = false;
        if (cleanup) {
            if (fsc.existsAbs(fbg)) {
                if (ctx.isWindows()) {
                    fsc.rd(fbg.toWindows(), td);
                } else {
                    fsc.rm(fbg.toUnix(), td);
                }
            }
        }
    });
    constructor() {
        super('FxContextManualApiTrial', [
            FxContextManualApiTrial.testExistsAbs,
            FxContextManualApiTrial.testExists,
            FxContextManualApiTrial.testMkSymlink
        ]);
    }
}

const suite = new TrialSuite('SLink Manual Trial Suite ', [
    new FxContextManualApiTrial()
]);
suite.run().printTextReport().printTestReportFiles(new JUnitXmlGenerator());