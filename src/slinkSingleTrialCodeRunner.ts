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

import { PathApiTrial } from './pathApiTrial.mjs';
import { PathsApiTrial } from './pathsApiTrial.mjs';
import { CliCtxTrial } from './cliCtxTrial.mjs';
import { runTrial } from '../../tests4ts.ts.adligo.org/src/singleTrialRunner.mjs';
import { ApiTrial } from '../../tests4ts.ts.adligo.org/src/trials.mjs';
import { AssertionContext } from '../../tests4ts.ts.adligo.org/src/assertions.mjs';
import { Test, TestParams } from '../../tests4ts.ts.adligo.org/src/tests.mjs';
import { JUnitXmlGenerator } from '../../junit-xml-tests4j.ts.adligo.org/src/junitXmlTests4jGenerator.mjs';
import {PackageJsonComparatorApiTrial} from "./packageJsonComparatorApiTrial.mjs";

runTrial(
  //new PathApiTrial()
  new PackageJsonComparatorApiTrial()
);
