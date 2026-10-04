/**
 * A runner error the web engine throws, loaded the way a project loads it:
 * from a config file, so the engine's `e2e/engine` and the runner's core are
 * two module copies and `instanceof` cannot recognize the engine's
 * `TestError`. It must keep its code and category, both in the test that
 * catches it and in the report.
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { startFixtureApp, type FixtureApp } from '../helpers/fixture-app.ts';
import {
  resultByTitle,
  runProjectWithConfigFile,
  workerConfigSource,
  type FixtureProject,
  type RunOutcome,
} from '../helpers/run-project.ts';

const SUITE = `import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

test('a caught engine TestError keeps its code', async ({ app, browser }) => {
  await app.open();
  let code = 'no error';
  try {
    await browser.locator('*css=ul[data-testid="items"] >> li').count();
  } catch (error) {
    code = error.code ?? 'no code';
  }
  expect(code).toBe('INVALID_LOCATOR');
});

test('an uncaught engine TestError fails the test with its code', async ({ app, browser }) => {
  await app.open();
  await browser.locator('*css=ul[data-testid="items"] >> li').count();
});
`;

describe('engine errors across module copies', () => {
  let app: FixtureApp;
  let outcome: RunOutcome;
  let project: FixtureProject;

  beforeAll(async () => {
    app = await startFixtureApp();
    ({ outcome, project } = await runProjectWithConfigFile(
      { 'tests/errors.e2e.ts': SUITE },
      { appUrl: app.url, configSource: workerConfigSource(1, "\n  cache: 'off',") },
    ));
  }, 240_000);

  afterAll(async () => {
    project?.cleanup();
    await app?.close();
  });

  it('hands the test the engine code, not ENGINE_FAILURE', () => {
    const result = resultByTitle(outcome, 'a caught engine TestError keeps its code');
    expect(result.status, JSON.stringify(result.attempts[0]?.error)).toBe('passed');
  });

  it('reports the engine code as a test failure', () => {
    const result = resultByTitle(outcome, 'an uncaught engine TestError fails the test with its code');
    expect(result.status).toBe('failed');
    expect(result.attempts[0]!.error).toMatchObject({ category: 'test', code: 'INVALID_LOCATOR' });
  });
});
