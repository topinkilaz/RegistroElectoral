export type RolNombre = "ADMIN" | "EDITOR" | "VISOR";
export type EstadoUsuario = "ACTIVO" | "INACTIVO";

export interface Rol {
	id: number;
	nombre: RolNombre;
}

export interface Usuario {
	id: number;
	nombres: string;
	apellidos: string;
	numDocumento: string;
	fechaLimiteAcceso: string;
	usuario: string;
	estado: EstadoUsuario;
	createdAt: string;
	celular: string;
	ultimoAcceso: string | null;
	roles: Rol[];
}

export interface PaginationInfo {
	page: number;
	limit: number;
	totalItems: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

export interface UsuariosResponse {
	statusCode: number;
	message: string;
	data: Usuario[];
	pagination: PaginationInfo;
}

export interface UsuariosParams {
	page?: number;
	limit?: number;
	search?: string;
}

export interface CreateUsuarioDto {
	nombres: string;
	apellidos: string;
	numDocumento: string;
	celular: string;
	estado: EstadoUsuario;
	rol: RolNombre[];
}

export interface UpdateUsuarioDto {
	nombres?: string;
	apellidos?: string;
	numDocumento?: string;
	celular?: string;
	usuario?: string;
}

export interface CambiarPasswordDto {
	password: string;
}

export interface CambiarEstadoDto {
	estado: EstadoUsuario;
}
export interface ReemplazarRolDto {
	rol: RolNombre[];
}

// Verificación de usuario
export interface UsuarioVerificacionInfo {
	id: number;
	nombres: string;
	apellidos: string;
	numDocumento: string;
	celular?: string;
}

export interface VerificarUsuarioResponse {
	ci: {
		existe: boolean;
		usuario: UsuarioVerificacionInfo | null;
	};
	celular: {
		enUso: boolean;
		usuarios: UsuarioVerificacionInfo[];
	};
}

export interface VerificarUsuarioParams {
	numDocumento?: string;
	celular?: string;
}