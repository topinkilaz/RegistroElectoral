import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
	getUsuarios,
	createUsuario,
	updateUsuario,
	cambiarPassword,
	cambiarEstado,
	reemplazarRol,
} from "@/lib/api/usuarios";
import type {
	UsuariosParams,
	CreateUsuarioDto,
	UpdateUsuarioDto,
	CambiarPasswordDto,
	CambiarEstadoDto,
	ReemplazarRolDto,
} from "@/lib/types/usuario";
import { useAuth } from "@/lib/context/auth-context";

interface ApiError {
	message: string;
	statusCode?: number;
}

export function useUsuarios(params?: UsuariosParams) {
	const { isAuthenticated } = useAuth();

	return useQuery({
		queryKey: ["usuarios", params],
		queryFn: () => getUsuarios(params),
		enabled: isAuthenticated,
		retry: false,
	});
}

export function useCreateUsuario() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createUsuario,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["usuarios"] });
		},
	});
}

export function useUpdateUsuario() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: UpdateUsuarioDto }) =>
			updateUsuario(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["usuarios"] });
		},
	});
}

export function useCambiarPassword() {
	return useMutation<void, AxiosError<ApiError>, { id: number; data: CambiarPasswordDto }>({
		mutationFn: ({ id, data }) => cambiarPassword(id, data),
	});
}

export function useCambiarEstado() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: CambiarEstadoDto }) =>
			cambiarEstado(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["usuarios"] });
		},
	});
}
export function useReemplazarRol() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: number; data: ReemplazarRolDto }) =>
			reemplazarRol(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["usuarios"] });
		},
	});
}
