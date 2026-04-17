import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";

export interface MunicipioRelacion {
  id: number;
  nombre: string;
}

export interface Localidad {
  id: number;
  nombre: string;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  eliminado: boolean;
  procesoId: number;
  municipio: MunicipioRelacion;
}

export interface LocalidadesResponse {
  statusCode: number;
  message: string;
  data: Localidad[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export async function getLocalidades(search?: string, page: number = 1, limit: number = 10): Promise<LocalidadesResponse> {
  const params: any = { page, limit };
  if (search && search.trim()) {
    params.search = search.trim();
  }
  const { data } = await api.get<LocalidadesResponse>("/localidades", { params });
  return data;
}

export function useLocalidades(search?: string, page: number = 1, limit: number = 10, enabled: boolean = true) {
  return useQuery({
    queryKey: ["localidades", search, page, limit],
    queryFn: () => getLocalidades(search, page, limit),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}