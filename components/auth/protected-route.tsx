"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/context/auth-context";
import type { Role } from "@/lib/config/roles";

interface ProtectedRouteProps {
	children: React.ReactNode;
	allowedRoles?: Role[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
	const { isAuthenticated, isLoading, hasRouteAccess, userRoles } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.replace("/login");
			return;
		}

		if (!isLoading && isAuthenticated) {
			// Verificar acceso por roles específicos o por ruta
			const hasAccess = allowedRoles
				? allowedRoles.some((role) =>
						userRoles.some((r) => r.toUpperCase() === role)
					)
				: hasRouteAccess(pathname);

			if (!hasAccess) {
				router.replace("/error/403");
			}
		}
	}, [isAuthenticated, isLoading, router, pathname, hasRouteAccess, allowedRoles, userRoles]);

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
			</div>
		);
	}

	if (!isAuthenticated) {
		return null;
	}

	// Verificar acceso antes de renderizar
	const hasAccess = allowedRoles
		? allowedRoles.some((role) =>
				userRoles.some((r) => r.toUpperCase() === role)
			)
		: hasRouteAccess(pathname);

	if (!hasAccess) {
		return null;
	}

	return <>{children}</>;
}
