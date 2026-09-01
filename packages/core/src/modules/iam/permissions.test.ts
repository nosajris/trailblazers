/**
 * Policy tests for the staff portal.
 *
 * This repo has no unit-test runner, so these run on Node's built-in test
 * runner with type stripping and no dependencies:
 *
 *   node --experimental-strip-types --test packages/core/src/modules/iam/permissions.test.ts
 *
 * Keep this file import-free apart from node: builtins and the module under
 * test, or type stripping will not be able to resolve it.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
	canAccessAdmin,
	canAccessPath,
	canAccessSection,
	canManageUsers,
	checkUserMutation,
	sectionForPath
} from './permissions.ts';

// The check that used to guard the entire portal, reproduced here so the
// regression it allowed stays visible.
const legacyCanAccessAdmin = (role: string | undefined) => role === 'ADMIN' || role === 'SECRETARY';

test('the escalation this fixes: the old check let a secretary reach /users', () => {
	assert.equal(legacyCanAccessAdmin('SECRETARY'), true, 'old check admitted SECRETARY');
	assert.equal(canAccessPath('SECRETARY', '/users'), false, 'new check denies SECRETARY');
});

test('portal entry is limited to staff roles', () => {
	assert.equal(canAccessAdmin('ADMIN'), true);
	assert.equal(canAccessAdmin('SECRETARY'), true);
	assert.equal(canAccessAdmin('LEADER'), false);
	assert.equal(canAccessAdmin('MEMBER'), false);
	assert.equal(canAccessAdmin(null), false);
	assert.equal(canAccessAdmin(undefined), false);
});

test('admin-only sections reject every role but ADMIN', () => {
	for (const section of ['users', 'settings', 'audit'] as const) {
		assert.equal(canAccessSection('ADMIN', section), true, `ADMIN -> ${section}`);
		assert.equal(canAccessSection('SECRETARY', section), false, `SECRETARY -> ${section}`);
		assert.equal(canAccessSection('LEADER', section), false, `LEADER -> ${section}`);
		assert.equal(canAccessSection('MEMBER', section), false, `MEMBER -> ${section}`);
		assert.equal(canAccessSection(null, section), false, `anonymous -> ${section}`);
	}
});

test('secretaries keep content and submissions', () => {
	assert.equal(canAccessSection('SECRETARY', 'content'), true);
	assert.equal(canAccessSection('SECRETARY', 'submissions'), true);
	assert.equal(canAccessPath('SECRETARY', '/events'), true);
	assert.equal(canAccessPath('SECRETARY', '/sermons'), true);
	assert.equal(canAccessPath('SECRETARY', '/statistics'), true);
	assert.equal(canAccessPath('SECRETARY', '/submissions'), true);
	assert.equal(canAccessPath('SECRETARY', '/'), true);
});

test('paths map to their section, including nested and trailing-slash forms', () => {
	assert.equal(sectionForPath('/users'), 'users');
	assert.equal(sectionForPath('/users/'), 'users');
	assert.equal(sectionForPath('/users/42'), 'users');
	assert.equal(sectionForPath('/settings'), 'settings');
	assert.equal(sectionForPath('/audit-logs'), 'audit');
	assert.equal(sectionForPath('/submissions'), 'submissions');
	assert.equal(sectionForPath('/events'), 'content');
	assert.equal(sectionForPath('/'), 'content');
});

test('a look-alike path does not inherit a protected section', () => {
	// `/users-export` must not be treated as a prefix match for `/users`, and
	// must not silently fall through to the permissive `content` default either
	// — it lands on content, which is what an unlisted content route should do.
	assert.equal(sectionForPath('/usersomething'), 'content');
	assert.equal(sectionForPath('/settings-archive'), 'content');
	// The important half: a secretary still cannot reach the real one.
	assert.equal(canAccessPath('SECRETARY', '/users'), false);
	assert.equal(canAccessPath('SECRETARY', '/users/42'), false);
});

test('only admins manage users', () => {
	assert.equal(canManageUsers('ADMIN'), true);
	assert.equal(canManageUsers('SECRETARY'), false);
	assert.equal(canManageUsers(null), false);
});

test('a secretary cannot mutate accounts even if a form reaches the action', () => {
	const decision = checkUserMutation(
		{ id: 2, role: 'SECRETARY' },
		{ kind: 'update', targetId: 2, targetRole: 'SECRETARY', nextRole: 'ADMIN' }
	);
	assert.equal(decision.allowed, false);
});

test('an admin cannot change their own role', () => {
	const decision = checkUserMutation(
		{ id: 1, role: 'ADMIN' },
		{ kind: 'update', targetId: 1, targetRole: 'ADMIN', nextRole: 'MEMBER' }
	);
	assert.equal(decision.allowed, false);
});

test('an admin may edit their own profile as long as the role is unchanged', () => {
	const decision = checkUserMutation(
		{ id: 1, role: 'ADMIN' },
		{ kind: 'update', targetId: 1, targetRole: 'ADMIN', nextRole: 'ADMIN' }
	);
	assert.equal(decision.allowed, true);
});

test('an admin may change someone else’s role', () => {
	const decision = checkUserMutation(
		{ id: 1, role: 'ADMIN' },
		{ kind: 'update', targetId: 2, targetRole: 'MEMBER', nextRole: 'SECRETARY' }
	);
	assert.equal(decision.allowed, true);
});

test('an admin cannot delete their own account', () => {
	const decision = checkUserMutation(
		{ id: 1, role: 'ADMIN' },
		{ kind: 'delete', targetId: 1 }
	);
	assert.equal(decision.allowed, false);
});

test('an admin may delete another account, and may create one', () => {
	assert.equal(
		checkUserMutation({ id: 1, role: 'ADMIN' }, { kind: 'delete', targetId: 2 }).allowed,
		true
	);
	assert.equal(
		checkUserMutation({ id: 1, role: 'ADMIN' }, { kind: 'create', nextRole: 'SECRETARY' }).allowed,
		true
	);
});
