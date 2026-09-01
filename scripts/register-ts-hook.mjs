/**
 * Registers the `.js` -> `.ts` resolver hook for the test run.
 *
 * Loaded via `node --import ./scripts/register-ts-hook.mjs`, which runs before
 * any test file is imported. See ts-resolve-hook.mjs for why this is needed.
 */

import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register('./ts-resolve-hook.mjs', pathToFileURL(import.meta.filename));
