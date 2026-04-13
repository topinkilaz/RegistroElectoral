import { api } from "./axios";
import type {
	UsuariosResponse,
	UsuariosParams,
	CreateUsuarioDto,
	UpdateUsuarioDto,
	CambiarPasswordDto,
	CambiarEstadoDto,
	Usuario,
	ReemplazarRolDto,
} from "@/lib/types/usuario";

export async function getUsuarios(params?: UsuariosParams): Promise<UsuariosResponse> {
	const { data } = await api.get<UsuariosResponse>("/usuarios", { params });
	return data;
}

export async function createUsuario(dto: CreateUsuarioDto): Promise<Usuario> {
	const { data } = await api.post("/usuarios/register", dto);
	return data;
}

export async function updateUsuario(id: number, dto: UpdateUsuarioDto): Promise<Usuario> {
	const { data } = await api.patch(`/usuarios/${id}/editar`, dto);
	return data;
}

export async function cambiarPassword(id: number, dto: CambiarPasswordDto): Promise<void> {
	await api.patch(`/usuarios/${id}/cambiar-password`, dto);
}

export async function cambiarEstado(id: number, dto: CambiarEstadoDto): Promise<Usuario> {
	const { data } = await api.patch(`/usuarios/${id}/cambiar-estado`, dto);
	return data;
}
export async function reemplazarRol(id: number, dto: ReemplazarRolDto): Promise<Usuario> {
	const { data } = await api.post(`/usuarios/${id}/reemplazar-rol`, dto);
	return data;
}