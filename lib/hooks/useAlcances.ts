import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
	getPaises,
	getDepartamentos,
	getProvincias,
	getMunicipios,
	getDistritosMunicipales,
	getLocalidades,
	getCircunscripciones,
	getRecintos,
	asignarAlcancesBulk,
	getUsuarioAlcances,
	eliminarAlcance,
} from "@/lib/api/alcances";
import type { AlcanceBulkRequest } from "@/lib/types/alcance";

// Hook único para obtener todas las listas geográficas
export const useListasGeograficas = (enabled: boolean = true) => {
	const paisesQuery = useQuery({
		queryKey: ["paises"],
		queryFn: getPaises,
		enabled,
		staleTime: 1000 * 60 * 10, // 10 minutos
	});

	const departamentosQuery = useQuery({
		queryKey: ["departamentos"],
		queryFn: getDepartamentos,
		enabled,
		staleTime: 1000 * 60 * 10,
	});

	const provinciasQuery = useQuery({
		queryKey: ["provincias"],
		queryFn: getProvincias,
		enabled,
		staleTime: 1000 * 60 * 10,
	});

	const municipiosQuery = useQuery({
		queryKey: ["municipios"],
		queryFn: getMunicipios,
		enabled,
		staleTime: 1000 * 60 * 10,
	});

	const distritosMunicipalesQuery = useQuery({
		queryKey: ["distritos-municipales"],
		queryFn: getDistritosMunicipales,
		enabled,
		staleTime: 1000 * 60 * 10,
	});

	const localidadesQuery = useQuery({
		queryKey: ["localidades"],
		queryFn: getLocalidades,
		enabled,
		staleTime: 1000 * 60 * 10,
	});

	const circunscripcionesQuery = useQuery({
		queryKey: ["circunscripciones"],
		queryFn: getCircunscripciones,
		enabled,
		staleTime: 1000 * 60 * 10,
	});

	const isLoading =
		paisesQuery.isLoading ||
		departamentosQuery.isLoading ||
		provinciasQuery.isLoading ||
		municipiosQuery.isLoading ||
		distritosMunicipalesQuery.isLoading ||
		localidadesQuery.isLoading ||
		circunscripcionesQuery.isLoading;

	return {
		paises: paisesQuery.data || [],
		departamentos: departamentosQuery.data || [],
		provincias: provinciasQuery.data || [],
		municipios: municipiosQuery.data || [],
		distritosMunicipales: distritosMunicipalesQuery.data || [],
		localidades: localidadesQuery.data || [],
		circunscripciones: circunscripcionesQuery.data || [],
		isLoading,
	};
};

// Hook para buscar recintos con debounce
export const useRecintos = (search: string, enabled: boolean = true) => {
	return useQuery({
		queryKey: ["recintos", search],
		queryFn: () => getRecintos(search),
		enabled: enabled,
		staleTime: 1000 * 60 * 5, // 5 minutos
	});
};

// Hook para obtener alcances de un usuario
export const useUsuarioAlcances = (
	usuarioId: number | null,
	procesoId: number | null,
	enabled: boolean = true
) => {
	return useQuery({
		queryKey: ["usuario-alcances", usuarioId, procesoId],
		queryFn: () => getUsuarioAlcances(usuarioId!, procesoId!),
		enabled: enabled && !!usuarioId && !!procesoId,
	});
};

// Mutation para asignar alcances
export const useAsignarAlcances = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: AlcanceBulkRequest) => asignarAlcancesBulk(data),
		onSuccess: (_, variables) => {
			queryClient.invalidateQueries({ queryKey: ["usuarios"] });
			queryClient.invalidateQueries({
				queryKey: ["usuario-alcances", variables.usuarioId, variables.procesoId],
			});
		},
	});
};

// Mutation para eliminar un alcance
export const useEliminarAlcance = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => eliminarAlcance(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["usuario-alcances"] });
		},
	});
};
