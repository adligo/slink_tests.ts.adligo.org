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
import { Path, Paths } from '../../slink.ts.adligo.org/src/slink.mjs';


export class PathsApiTrial extends ApiTrial {
  public static TESTS: I_Test[] = [
    new Test('testPathConstruction', (ac: I_AssertionContext) => {
      // Test absolute path
      const absPath = new Path(['home', 'user', 'project'], false);
      ac.isFalse(absPath.isRelative(), 'Path should be absolute');
      ac.isFalse(absPath.isWindows(), 'Path should not be Windows by default');

      // Test relative path
      const relPath = new Path(['src', 'main'], true);
      ac.isTrue(relPath.isRelative(), 'Path should be relative');

      // Test Windows path
      const winPath = new Path(['C', 'Users', 'user'], false, true);
      ac.isTrue(winPath.isWindows(), 'Path should be Windows');

      // Test getParts
      const parts = absPath.getParts();
      ac.isTrue(parts.length === 3, 'Path should have 3 parts');
      ac.same('home', parts[0], 'First part should be "home"');
      ac.same('user', parts[1], 'Second part should be "user"');
      ac.same('project', parts[2], 'Third part should be "project"');
    }),
    new Test('testPathToString', (ac: I_AssertionContext) => {
      // Test Unix absolute path
      const unixAbsPath = new Path(['home', 'user', 'project'], false);
      ac.same('/home/user/project', unixAbsPath.toPathString(), 'Unix absolute path string incorrect');

      // Test Unix relative path
      const unixRelPath = new Path(['src', 'main'], true);
      ac.same('src/main', unixRelPath.toPathString(), 'Unix relative path string incorrect');

      // Test Windows absolute path
      const winAbsPath = new Path(['C', 'Users', 'user'], false, true);
      ac.same('C:\\Users\\user', winAbsPath.toPathString(), 'Windows absolute path string incorrect');

      // Test Windows relative path
      const winRelPath = new Path(['src', 'main'], true, true);
      ac.same('src\\main', winRelPath.toPathString(), 'Windows relative path string incorrect');
    }),
    new Test('testPathsToParts', (ac: I_AssertionContext) => {
      // Test Unix path
      const unixPath = Paths.toPath('/home/user/project', false);
      ac.same('home', unixPath.getParts()[0], 'Unix path first part incorrect');
      ac.same('user', unixPath.getParts()[1], 'Unix path second part incorrect');
      ac.same('project', unixPath.getParts()[2], 'Unix path third part incorrect');

      // Test Windows path
      const winPath = Paths.toPath('C:\\Users\\user', false);
      ac.same('C', winPath.getParts()[0], 'Windows path first part incorrect');
      ac.same('Users', winPath.getParts()[1], 'Windows path second part incorrect');
      ac.same('user', winPath.getParts()[2], 'Windows path third part incorrect');

      // Test GitBash style Windows path
      const gitBashPath = Paths.toPath('C:/Users/user', false);
      ac.same('C', gitBashPath.getParts()[0], 'GitBash path first part incorrect');
      ac.same('Users', gitBashPath.getParts()[1], 'GitBash path second part incorrect');
      ac.same('user', gitBashPath.getParts()[2], 'GitBash path third part incorrect');
    }),
    new Test('testPathsFind', (ac: I_AssertionContext) => {
      // Test finding an absolute path from a base path and a relative path
      const basePath = new Path(['home', 'user', 'project'], false);
      const relPath = new Path(['..', 'otherproject', 'src'], true);

      const foundPath = Paths.find(basePath, relPath);
      ac.same('home', foundPath.getParts()[0], 'Found path first part incorrect');
      ac.same('user', foundPath.getParts()[1], 'Found path second part incorrect');
      ac.same('otherproject', foundPath.getParts()[2], 'Found path third part incorrect');
      ac.same('src', foundPath.getParts()[3], 'Found path fourth part incorrect');
    })
  ];
  constructor() {
    super('org.adligo.ts.slink_tests.PathsApiTrial', PathsApiTrial.TESTS);
  }
}
