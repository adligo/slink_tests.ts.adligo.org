/**
 * This is a manual trial that should be run only be developers on their machines, not on the build server.
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


import { ApiTrial, AssertionContext, Test, TestParams, TrialSuite } from '../../tests4ts.ts.adligo.org/src/tests4ts.mjs';
import { CliCtx, FsContext, Path, Paths, ShellRunner, FLAGS } from '../../slink.ts.adligo.org/src/slink.mjs';
import { JUnitXmlGenerator } from '../../junitXml.tests4j.ts.adligo.org/src/junitXmlTests4jGenerator.mjs';

console.log("wtf");

console.log("process.argv is; \n\t" + process.argv);
const ctx: CliCtx = new CliCtx(FLAGS, process.argv.concat('--debug'));
const fsc: FsContext = new FsContext(ctx);
const cwd = process.cwd();
console.log("runDir is; \n\t" + cwd);
let pCwd : Path = Paths.toPath(cwd, false);

export class FxContextManualApiTrial extends ApiTrial {
    public static testExistsAbs: Test = new Test(TestParams.of('testExistsAbs'), (ac: AssertionContext) => {
        ac.isTrue(fsc.existsAbs(new Path(pCwd.getParts().concat('test_data'), false)),
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
    public static testExists: Test = new Test(TestParams.of('testExists'), (ac: AssertionContext) => {
        ac.isTrue(fsc.exists(new Path(['test_data'], true), pCwd),
            "The test_data should show as exist");
        ac.isTrue(fsc.exists(new Path(['test_data','foo'], true), pCwd),
            "The test_data/foo should show as exist");
        ac.isTrue(fsc.exists(new Path(['test_data','package.json'], true), pCwd),
            "The test_data/package.json should show as exist");

        ac.isFalse(fsc.exists(new Path(['test_data2'], true), pCwd),
            "The test_data2 should show as exist");
        ac.isFalse(fsc.exists(new Path(['test_data', 'foo3'], true), pCwd),
            "The test_data/foo3 should show as exist");
        ac.isFalse(fsc.exists(new Path(['test_data','package4.json'], true), pCwd),
            "The test_data/package4.json should show as exist");
    });
    constructor() {
        super('FxContextManualApiTrial', [
            FxContextManualApiTrial.testExistsAbs,
            FxContextManualApiTrial.testExists
        ]);
    }
}

const suite = new TrialSuite('SLink Manual Trial Suite ', [
    new FxContextManualApiTrial()
]);
suite.run().printTextReport().printTestReportFiles(new JUnitXmlGenerator());