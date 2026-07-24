export type UserRole = 'ADMIN' | 'SECRETARY' | 'LEADER' | 'MEMBER';

export type PublicUserVm = {
	id: number;
	email: string;
	fullName: string;
	role: UserRole;
};
