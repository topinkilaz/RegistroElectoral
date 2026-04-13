import { api } from "./axios";
import type {
	ItemLista,
	DistritoMunicipal,
	Circunscripcion,
	ListaResponse,
	RecintoResponse,
	AlcanceBulkRequest,
	UsuarioAlcance,
} from "@/lib/types/alcance";

// GET - Listas geográficas
export const getPaises = async (): Promise<ItemLista[]> => {
	const response = await api.get<ListaResponse<ItemLista>>("/paises/lista");
	return response.data.data;
};

export const getDepartamentos = async (): Promise<ItemLista[]> => {
	const response = await api.get<ListaResponse<ItemLista>>("/departamentos/lista");
	return response.data.data;
};

export const getProvincias = async (): Promise<ItemLista[]> => {
	const response = await api.get<ListaResponse<ItemLista>>("/provincias/lista");
	return response.data.data;
};

export const getMunicipios = async (): Promise<ItemLista[]> => {
	const response = await api.get<ListaResponse<ItemLista>>("/municipios/lista");
	return response.data.data;
};

export const getDistritosMunicipales = async (): Promise<DistritoMunicipal[]> => {
	const response = await api.get<DistritoMunicipal[]>("/distritos-municipales");
	return response.data;
};

export const getLocalidades = async (): Promise<ItemLista[]> => {
	const response = await api.get<ListaResponse<ItemLista>>("/localidades/get-localidades");
	return response.data.data;
};

export const getCircunscripciones = async (): Promise<Circunscripcion[]> => {
	const response = await api.get<Circunscripcion[]>("/circunscripcion");
	return response.data;
};

export const getRecintos = async (search?: string): Promise<RecintoResponse> => {
	const params = new URLSearchParams();
	params.append("limit", "200");
	if (search) {
		params.append("search", search);
	}
	const response = await api.get<RecintoResponse>(`/recintos?${params.toString()}`);
	return response.data;
};

// POST - Asignar alcances en bulk
export const asignarAlcancesBulk = async (data: AlcanceBulkRequest): Promise<void> => {
	await api.post("/usuario-alcance/bulk", data);
};

// GET - Obtener alcances de un usuario
export const getUsuarioAlcances = async (
	usuarioId: number,
	procesoId: number
): Promise<UsuarioAlcance[]> => {
	const response = await api.get<UsuarioAlcance[]>(
		`/usuario-alcance/usuario/${usuarioId}?procesoId=${procesoId}`
	);
	return response.data;
};

// DELETE - Eliminar un alcance
export const eliminarAlcance = async (id: number): Promise<void> => {
	await api.delete(`/usuario-alcance/${id}`);
};
