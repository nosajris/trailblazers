import type { UserRole } from '@trailblazers/core';

export function canAccessAdmin(role: UserRole | undefined): boolean {
	return role === 'ADMIN' || role === 'SECRETARY';
}
