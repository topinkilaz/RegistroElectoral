"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProcess } from "@/lib/context/process-context";
import { useAuth } from "@/lib/context/auth-context";
import { ROLES } from "@/lib/config/roles";
import { Loader2 } from "lucide-react";

interface ProcessRequiredRouteProps {
	children: React.ReactNode;
}

export function ProcessRequiredRoute({ children }: ProcessRequiredRouteProps) {
	const { hasSelectedProceso } = useProcess();
	const { userRoles, isLoading: isAuthLoading } = useAuth();
	const router = useRouter();

	// Check if user has ONLY DELEGADO or JEFE_RECINTO roles (without ADMIN, EDITOR, VISOR)
	const upperRoles = userRoles.map((r) => r.toUpperCase());
	const hasAdminRoles = upperRoles.some(
		(role) =>
			role === ROLES.ADMIN ||
			role === ROLES.EDITOR ||
			role === ROLES.VISOR
	);
	const hasDelegadoOrJefe = upperRoles.some(
		(role) =>
			role === ROLES.DELEGADO ||
			role === ROLES.JEFE_RECINTO
	);
	// Only redirect if user has DELEGADO/JEFE_RECINTO and NO admin roles
	const isDelegadoOrJefeOnly = hasDelegadoOrJefe && !hasAdminRoles;

	useEffect(() => {
		if (isAuthLoading) return;

		// If user is DELEGADO or JEFE_RECINTO, redirect to mi-asignacion
		if (isDelegadoOrJefeOnly) {
			router.replace("/mi-asignacion");
			return;
		}

		// Otherwise, require process selection
		if (!hasSelectedProceso) {
			router.replace("/seleccionar-proceso");
		}
	}, [hasSelectedProceso, router, isDelegadoOrJefeOnly, isAuthLoading]);

	// Don't render anything while checking auth
	if (isAuthLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	// If user is DELEGADO or JEFE_RECINTO, show loading while redirecting
	if (isDelegadoOrJefeOnly) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	if (!hasSelectedProceso) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return <>{children}</>;
}
