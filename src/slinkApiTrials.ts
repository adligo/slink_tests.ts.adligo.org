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
process.env['RUNNING_TESTS4TS'] = "TRUE";
import { PathApiTrial } from './pathApiTrial.mjs';
import { PathsApiTrial } from './pathsApiTrial.mjs';
import { SLinkRunnerApiTrial } from './slinkRunnerApiTrial.mjs';
import { CliCtxTrial } from './cliCtxTrial.mjs';
import { ApiTrial, AssertionContext, Test, TestResult, TrialSuite } from '../../tests4ts.ts.adligo.org/src/tests4ts.mjs';
import { JUnitXmlGenerator } from '../../junitXml.tests4j.ts.adligo.org/src/junitXmlTests4jGenerator.mjs';



const cliCtxTrial = new CliCtxTrial();
const pathApiTrial = new PathApiTrial();
const pathsApiTrial = new PathsApiTrial();
const slinkApiTrial = new SLinkRunnerApiTrial();

const suite = new TrialSuite('SLink Trial Suite ', [pathApiTrial, pathsApiTrial, cliCtxTrial, slinkApiTrial]);
suite.run().printTextReport().printTestReportFiles(new JUnitXmlGenerator());