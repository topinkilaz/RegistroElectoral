"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Vote, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import { useProcesos } from "@/lib/hooks/useProcesos";
import { useProcess } from "@/lib/context/process-context";
import { useAuth } from "@/lib/context/auth-context";
import { ROLES } from "@/lib/config/roles";
import type { Proceso } from "@/lib/types/proceso";
import { cn } from "@/lib/utils";

export default function SeleccionarProcesoPage() {
	const router = useRouter();
	const { data, isLoading, isError } = useProcesos();
	const { setProceso, hasSelectedProceso } = useProcess();
	const { user, userRoles, isLoading: isAuthLoading } = useAuth();

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

		// If user ONLY has DELEGADO or JEFE_RECINTO roles, redirect to mi-asignacion
		if (isDelegadoOrJefeOnly) {
			router.replace("/mi-asignacion");
			return;
		}

		if (hasSelectedProceso) {
			router.replace("/dashboard");
		}
	}, [hasSelectedProceso, router, isDelegadoOrJefeOnly, isAuthLoading]);

	const handleSelectProceso = (proceso: Proceso) => {
		if (proceso.estado !== "ACTIVO") return;
		setProceso(proceso);
		router.push("/dashboard");
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("es-ES", {
			day: "2-digit",
			month: "long",
			year: "numeric",
		});
	};

	const getNivelIcon = (nivel: string) => {
		switch (nivel) {
			case "NACIONAL":
				return "🇵🇪";
			case "DEPARTAMENTAL":
				return "🏛️";
			case "PROVINCIAL":
				return "🏘️";
			case "DISTRITAL":
				return "📍";
			default:
				return "📋";
		}
	};

	if (hasSelectedProceso || isDelegadoOrJefeOnly || isAuthLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50 p-4 md:p-8">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="text-center mb-10">
					<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
						<Vote className="w-8 h-8 text-primary" />
					</div>
					<h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
						Bienvenido, {user?.nombres || "Usuario"}
					</h1>
					<p className="text-muted-foreground text-lg">
						Selecciona el proceso electoral en el que deseas trabajar
					</p>
				</div>

				{/* Content */}
				{isLoading ? (
					<div className="flex flex-col items-center justify-center py-20">
						<Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
						<p className="text-muted-foreground">Cargando procesos...</p>
					</div>
				) : isError ? (
					<div className="text-center py-20">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
							<span className="text-2xl">❌</span>
						</div>
						<h3 className="text-xl font-semibold mb-2">Error al cargar procesos</h3>
						<p className="text-muted-foreground">
							No se pudieron obtener los procesos. Intenta recargar la página.
						</p>
					</div>
				) : data?.data.length === 0 ? (
					<div className="text-center py-20">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
							<span className="text-2xl">📭</span>
						</div>
						<h3 className="text-xl font-semibold mb-2">No hay procesos disponibles</h3>
						<p className="text-muted-foreground">
							Actualmente no hay procesos electorales registrados.
						</p>
					</div>
				) : (
					<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
						{data?.data.map((proceso) => {
							const isActive = proceso.estado === "ACTIVO";

							return (
								<Card
									key={proceso.id}
									onClick={() => handleSelectProceso(proceso)}
									className={cn(
										"relative overflow-hidden transition-all duration-300",
										isActive
											? "cursor-pointer hover:shadow-xl hover:scale-[1.02] hover:border-primary/50"
											: "opacity-60 cursor-not-allowed"
									)}
								>
									{/* Estado Badge */}
									<div className="absolute top-4 right-4">
										<Badge
											variant={isActive ? "default" : "secondary"}
											className={cn(
												isActive
													? "bg-green-500 hover:bg-green-600"
													: "bg-gray-400"
											)}
										>
											{isActive ? (
												<>
													<CheckCircle2 className="w-3 h-3 mr-1" />
													Activo
												</>
											) : (
												"Inactivo"
											)}
										</Badge>
									</div>

									<CardHeader className="pb-3">
										<div className="flex items-start gap-3">
											<div className="text-3xl">{getNivelIcon(proceso.nivelGeografico)}</div>
											<div className="flex-1 min-w-0">
												<CardTitle className="text-xl mb-1 truncate pr-16">
													{proceso.nombre}
												</CardTitle>
												<CardDescription className="line-clamp-2">
													{proceso.descripcion}
												</CardDescription>
											</div>
										</div>
									</CardHeader>

									<CardContent className="pt-0">
										<div className="space-y-3">
											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												<MapPin className="w-4 h-4" />
												<span>Nivel: {proceso.nivelGeografico}</span>
											</div>
											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												<Calendar className="w-4 h-4" />
												<span>Creado: {formatDate(proceso.createdAt)}</span>
											</div>
										</div>

										{isActive && (
											<div className="mt-4 pt-4 border-t">
												<div className="flex items-center justify-center gap-2 text-primary font-medium">
													<span>Seleccionar proceso</span>
													<span className="text-lg">→</span>
												</div>
											</div>
										)}
									</CardContent>
								</Card>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
