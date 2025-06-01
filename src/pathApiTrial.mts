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


import { ApiTrial, AssertionContext, Test, TestParams, TrialSuite } from '../../tests4ts.ts.adligo.org/src/tests4ts.mjs';
import { Path, Paths } from '../../slink.ts.adligo.org/src/slink.mjs';


export class PathApiTrial extends ApiTrial {
  public static testConstructorErrors: Test = new Test(TestParams.of('testIsRoot'), (ac: AssertionContext) => {
    let sa1 : string[] = [undefined];

    ac.error(Path.PARTS_MUST_HAVE_VALID_STRINGS  + sa1, () => {
      new Path(sa1, true, true);
    });
    let sa2 : string[] = [' '];
    ac.error(Path.PARTS_MUST_HAVE_NON_EMPTY_STRINGS  + sa2, () => {
      new Path(sa2, true, true);
    });
  });
  public static testIsRoot: Test = new Test(TestParams.of('testIsRoot'), (ac: AssertionContext) => {
    // Test absolute path Windows
    const absPath = new Path(['c', 'users'], false, true);
    ac.isFalse(absPath.isRoot(), 'c:\\users is NOT a root path');

    const absPath2 = new Path(['c'], false, true);
    ac.isTrue(absPath2.isRoot(), 'c:\\ is a root path');

    // Test absolute path Unix
    const absPathU1 = new Path(['c'], false, false);
    ac.isFalse(absPathU1.isRoot(), '/c is NOT a root path');

    const absPathU2 = new Path([], false, false);
    ac.isTrue(absPathU2.isRoot(), '/ is a root path');

    //relative paths
    const absPath3 = new Path(['c'], true, true);
    ac.isFalse(absPath3.isRoot(), 'c is a NOT root path');

    const absPath4 = new Path(['c'], true, false);
    ac.isFalse(absPath4.isRoot(), 'c is a NOT Unix root path');
  });
  public static testHasParent: Test = new Test(TestParams.of('testHasParent'), (ac: AssertionContext) => {
    // Test Unix absolute paths
    const absPath = new Path(['home', 'user', 'project'], false);
    ac.same('/home/user/project', Paths.toUnix(absPath), 'Unix absolute path conversion incorrect');
    ac.isTrue(absPath.hasParent(), "The path /home/user/project has a parent /home/user");

    const absPath2 = new Path(['home'], false);
    ac.isFalse(absPath2.hasParent(), "The path /home does not have a parent");

    // Test relative path
    const relPath = new Path(['src', 'main'], true);
    ac.same('src/main', Paths.toUnix(relPath), 'Unix relative path conversion incorrect');
    ac.isTrue(absPath.hasParent(), "The path src/main has a parent src");
  });

  public static testGetParent: Test = new Test(TestParams.of('testGetParent'), (ac: AssertionContext) => {
    // Test drive letter path
    const drivePath = new Path(['C', 'Users', 'user'], false);
    ac.same('C:\\Users\\user', Paths.toWindows(drivePath), 'Windows drive path conversion incorrect');

    // Test relative path
    const relPath = new Path(['src', 'main'], true);
    ac.same('src\\main', Paths.toWindows(relPath), 'Windows relative path conversion incorrect');
  });
  /**
   * Covers the following toString, toPathString and constructor
   */
  public static testToUnix: Test = new Test(TestParams.of('testToUnix'), (ac: AssertionContext) => {
    // Test absolute path
    const absPath = new Path(['home', 'user', 'project'], false, false);
    ac.same('/home/user/project', Paths.toUnix(absPath), 'Unix absolute path conversion incorrect');
    ac.equals('Path [parts=[home,user,project], relative=false, windows=false]', absPath.toString());
    ac.equals('/home/user/project', absPath.toPathString());
    
    // Test relative path
    const relPath = new Path(['src', 'main'], true);
    ac.same('src/main', Paths.toUnix(relPath), 'Unix relative path conversion incorrect');
    ac.equals('Path [parts=[src,main], relative=true, windows=false]', relPath.toString());
    ac.equals('src/main', relPath.toPathString());
  });
  public static testToWindows: Test = new Test(TestParams.of('testToWindows'), (ac: AssertionContext) => {
    // Test absolute path
    const absPath = new Path(['c', 'home', 'user', 'project'], false, true);
    ac.same('C:\\home\\user\\project', Paths.toWindows(absPath), 'Windows absolute path conversion incorrect');
    ac.equals('Path [parts=[c,home,user,project], relative=false, windows=true]', absPath.toString());
    ac.equals('c:\\home\\user\\project', absPath.toPathString());
    
    // Test relative path
    const relPath = new Path(['src', 'main'], true, true);
    ac.same('src\\main', Paths.toWindows(relPath), 'Windows relative path conversion incorrect');
    ac.equals('Path [parts=[src,main], relative=true, windows=true]', relPath.toString());
    ac.equals('src\\main', relPath.toPathString());
  });
  constructor() {
    super('PathApiTrial', [PathApiTrial.testHasParent, PathApiTrial.testGetParent, PathApiTrial.testToUnix,
      PathApiTrial.testToWindows, PathApiTrial.testIsRoot
    ]);
  }
}
