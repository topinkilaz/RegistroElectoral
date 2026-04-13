export type NivelAlcance =
	| "pais"
	| "departamento"
	| "provincia"
	| "municipio"
	| "distrito_municipal"
	| "localidad"
	| "circunscripcion"
	| "recinto"
	| "grupo_recinto";

export interface AlcanceItem {
	nivelAlcance: NivelAlcance;
	paisId?: number;
	departamentoId?: number;
	provinciaId?: number;
	municipioId?: number;
	distritoMunicipalId?: number;
	localidadId?: number;
	circunscripcionId?: number;
	recintoId?: number;
	grupoRecintoId?: number;
}

export interface AlcanceBulkRequest {
	usuarioId: number;
	procesoId: number;
	alcances: AlcanceItem[];
}

// Tipos para las listas geográficas
export interface ItemLista {
	id: number;
	nombre: string;
}

export interface DistritoMunicipal {
	id: number;
	nombre: string;
	codigo: string;
	municipio: {
		id: number;
		nombre: string;
	};
}

export interface Circunscripcion {
	id: number;
	numero: string;
	procesoId: number;
	municipioId: number;
	localidadId: number;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	eliminado: boolean;
	createdBy: string | null;
}

export interface Recinto {
	id: number;
	nombre: string;
}

export interface ListaResponse<T> {
	statusCode: number;
	message: string;
	data: T[];
}

export interface RecintoResponse {
	statusCode: number;
	message: string;
	data: Recinto[];
	pagination: {
		page: number;
		limit: number;
		totalItems: number;
		totalPages: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
}

// Tipo para permiso existente (respuesta del GET)
export interface UsuarioAlcance {
	id: number;
	nivelAlcance: NivelAlcance;
	estado: "ACTIVO" | "INACTIVO";
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	eliminado: boolean;
	createdBy: number | null;
	usuarioId: number;
	procesoId: number;
	paisId: number | null;
	departamentoId: number | null;
	provinciaId: number | null;
	municipioId: number | null;
	distritoMunicipalId: number | null;
	localidadId: number | null;
	circunscripcionId: number | null;
	recintoId: number | null;
	grupoRecintoId: number | null;
	usuario: {
		id: number;
		nombres: string;
		apellidos: string;
		numDocumento: string;
	};
	proceso: {
		id: number;
		nombre: string;
	};
	pais: ItemLista | null;
	departamento: ItemLista | null;
	provincia: ItemLista | null;
	municipio: ItemLista | null;
	distritoMunicipal: ItemLista | null;
	localidad: ItemLista | null;
	circunscripcion: { id: number; numero: string } | null;
	recinto: ItemLista | null;
	grupoRecinto: ItemLista | null;
}

// Mapeo de niveles a labels en español
export const NIVEL_ALCANCE_LABELS: Record<NivelAlcance, string> = {
	pais: "País",
	departamento: "Departamento",
	provincia: "Provincia",
	municipio: "Municipio",
	distrito_municipal: "Distrito Municipal",
	localidad: "Localidad",
	circunscripcion: "Circunscripción",
	recinto: "Recinto",
	grupo_recinto: "Grupo de Recinto",
};
