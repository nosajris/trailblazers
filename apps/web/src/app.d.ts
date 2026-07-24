import type { PublicUserVm } from '@trailblazers/core';

declare global {
	namespace App {
		interface Locals {
			user: PublicUserVm | null;
		}
	}
}

export {};
