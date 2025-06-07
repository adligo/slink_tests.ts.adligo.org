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
import { PackageJsonComparatorApiTrial } from './packageJsonComparatorApiTrial.mjs';
import { PathApiTrial } from './pathApiTrial.mjs';
import { PathsApiTrial } from './pathsApiTrial.mjs';
import { CliCtxTrial } from './cliCtxTrial.mjs';
import { ApiTrial, AssertionContext, Test, TestResult, TrialSuite } from '../../tests4ts.ts.adligo.org/src/tests4ts.mjs';
import { JUnitXmlGenerator } from '../../junitXml.tests4j.ts.adligo.org/src/junitXmlTests4jGenerator.mjs';

//full runs
import { HandleDependencySLinkGroupsUnix } from './etc/fullRuns/HandleDependencySLinkGroupsUnix.mjs';
import { HandleDependencySLinkGroupsWindows } from './etc/fullRuns/HandleDependencySLinkGroupsWindows.mjs';
import { HandleDependencySrcSLinksUnix } from './etc/fullRuns/HandleDependencySrcSLinksUnix.mjs';
import { HandleDependencySrcSLinksWindows } from './etc/fullRuns/HandleDependencySrcSLinksWindows.mjs';
import { HandleSharedNodeModulesViaEnvVarUnix } from './etc/fullRuns/HandleSharedNodeModulesViaEnvVarUnix.mjs';
import { HandleSharedNodeModulesViaEnvVarWindows } from './etc/fullRuns/HandleSharedNodeModulesViaEnvVarWindows.mjs';
import { HandleSharedNodeModulesViaProjectLinksUnix } from './etc/fullRuns/HandleSharedNodeModulesViaProjectLinksUnix.mjs';
import { HandleSharedNodeModulesViaProjectLinksWindows } from './etc/fullRuns/HandleSharedNodeModulesViaProjectLinksWindows.mjs';
import { PublishLocalUnix } from './etc/fullRuns/PublishLocalUnix.mjs';
import { PublishLocalWindows } from './etc/fullRuns/PublishLocalWindows.mjs';

const cliCtxTrial = new CliCtxTrial();
const packageJsonComparatorApiTrial = new PackageJsonComparatorApiTrial();
const pathApiTrial = new PathApiTrial();
const pathsApiTrial = new PathsApiTrial();
const handleDependencySLinkGroupsUnixApiTrial = new HandleDependencySLinkGroupsUnix();
const handleDependencySLinkGroupsWindowsApiTrial = new HandleDependencySLinkGroupsWindows();
const handleDependencySrcSLinksUnixApiTrial = new HandleDependencySrcSLinksUnix();
const handleDependencySrcSLinksWindowsApiTrial = new HandleDependencySrcSLinksWindows();
const handleSharedNodeModulesViaEnvVarUnixApiTrial = new HandleSharedNodeModulesViaEnvVarUnix();
const handleSharedNodeModulesViaEnvVarWindowsApiTrial = new HandleSharedNodeModulesViaEnvVarWindows();
const handleSharedNodeModulesViaProjectLinksUnixApiTrial = new HandleSharedNodeModulesViaProjectLinksUnix();
const handleSharedNodeModulesViaProjectLinksWindowsApiTrial = new HandleSharedNodeModulesViaProjectLinksWindows();
const publishLocalUnixApiTrial = new PublishLocalUnix();
const publishLocalWindowsApiTrial = new PublishLocalWindows();
                     
export const ALL_TRIALS: ApiTrial[] = [cliCtxTrial, packageJsonComparatorApiTrial, pathApiTrial, pathsApiTrial,
  handleDependencySLinkGroupsUnixApiTrial , handleDependencySLinkGroupsWindowsApiTrial,
  handleDependencySrcSLinksUnixApiTrial, handleDependencySrcSLinksWindowsApiTrial,
  handleSharedNodeModulesViaEnvVarUnixApiTrial, handleSharedNodeModulesViaEnvVarWindowsApiTrial,
  handleSharedNodeModulesViaProjectLinksUnixApiTrial, handleSharedNodeModulesViaProjectLinksWindowsApiTrial,
  publishLocalUnixApiTrial, publishLocalWindowsApiTrial
];

export const ALL_TRIAL_MAP: Map<string, ApiTrial> = new Map();
for (let trial of ALL_TRIALS) {
  ALL_TRIAL_MAP.set(trial.getName(), trial);
}
Object.freeze(ALL_TRIAL_MAP);