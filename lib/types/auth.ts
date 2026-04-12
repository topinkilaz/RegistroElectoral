export interface LoginCredentials {
	usuario: string;
	password: string;
}

export interface UserInfo {
	id: number;
	nombres: string;
	apellidos: string | null;
	numDocumento: string;
	celular: string;
	usuario: string;
	ultimoAcceso: string | null;
	fechaLimiteAcceso: string | null;
	createdBy: string | null;
	roles: string[];
}

export interface LoginResponse {
	success: boolean;
	first_login: boolean;
	message: string;
	user: UserInfo;
	token: string;
	refresh_token: string;
}

export interface RefreshTokenResponse {
	token: string;
	refresh_token?: string;
}

export interface AuthError {
	message: string;
	statusCode?: number;
}
