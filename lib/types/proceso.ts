export type EstadoProceso = "ACTIVO" | "INACTIVO";
export type NivelGeografico = "NACIONAL" | "DEPARTAMENTAL" | "PROVINCIAL" | "DISTRITAL";

export interface Proceso {
	id: number;
	nombre: string;
	descripcion: string;
	nivelGeografico: NivelGeografico;
	estado: EstadoProceso;
	createdAt: string;
}

export interface ProcesosResponse {
	statusCode: number;
	message: string;
	data: Proceso[];
	pagination: {
		page: number;
		limit: number;
		totalItems: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
}
