/**
 * 
 * Note you will run this with a cli command like;
 * npm run testWindows -- -test TrialName.testName
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
process.env['RUNNING_TESTS4TS'] = "TRUE";
import { ALL_TRIAL_MAP } from './allTrials.mjs';
import { runTest, SingleTestRunner } from '@ts.adligo.org/tests4ts/dist/singleTestRunner.mjs';
import { ApiTrial } from '../../tests4ts.ts.adligo.org/src/trials.mjs';
import { AssertionContext } from '../../tests4ts.ts.adligo.org/src/assertions.mjs';
import { Test, TestParams } from '../../tests4ts.ts.adligo.org/src/tests4ts.mjs';
import { JUnitXmlGenerator } from '../../junit-xml-tests4j.ts.adligo.org/src/junitXmlTests4jGenerator.mjs';

new SingleTestRunner(ALL_TRIAL_MAP).runTest();