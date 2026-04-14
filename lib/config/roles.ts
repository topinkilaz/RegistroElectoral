
export const ROLES = {
	ADMIN: "ADMIN",
	EDITOR: "EDITOR",
	VISOR: "VISOR",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];


export const ROUTE_PERMISSIONS: Record<string, Role[]> = {
	// Dashboard - todos pueden acceder
	"/dashboard": [ROLES.ADMIN, ROLES.EDITOR, ROLES.VISOR],

	// Usuarios - solo admin
	"/dashboard/users": [ROLES.ADMIN],

	// Asignaciones - admin y editor
	"/dashboard/assignments": [ROLES.ADMIN, ROLES.EDITOR],

	// Agrupaciones - admin y editor
	"/dashboard/agrupaciones": [ROLES.ADMIN, ROLES.EDITOR],

	// Distritos - admin y editor
	"/dashboard/distritos": [ROLES.ADMIN, ROLES.EDITOR],

	// Recintos - admin y editor
	"/dashboard/recintos-table": [ROLES.ADMIN, ROLES.EDITOR],

	// Settings - admin y editor
	"/dashboard/settings": [ROLES.ADMIN, ROLES.EDITOR],
};


export function hasRouteAccess(userRoles: string[], route: string): boolean {
	const allowedRoles = ROUTE_PERMISSIONS[route];

	
	if (!allowedRoles) {
		return true;
	}

	
	return userRoles.some((role) =>
		allowedRoles.includes(role.toUpperCase() as Role)
	);
}


export function getPrimaryRole(roles: string[]): Role | null {
	const upperRoles = roles.map((r) => r.toUpperCase());

	if (upperRoles.includes(ROLES.ADMIN)) return ROLES.ADMIN;
	if (upperRoles.includes(ROLES.EDITOR)) return ROLES.EDITOR;
	if (upperRoles.includes(ROLES.VISOR)) return ROLES.VISOR;

	return null;
}


export function hasRole(userRoles: string[], role: Role): boolean {
	return userRoles.some((r) => r.toUpperCase() === role);
}


export function isAdmin(userRoles: string[]): boolean {
	return hasRole(userRoles, ROLES.ADMIN);
}
