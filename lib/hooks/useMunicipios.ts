import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";

export interface ProvinciaRelacion {
  id: number;
  nombre: string;
}

export interface Municipio {
  id: number;
  nombre: string;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  eliminado: boolean;
  procesoId: number;
  provincia: ProvinciaRelacion;
}

export interface MunicipiosResponse {
  statusCode: number;
  message: string;
  data: Municipio[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export async function getMunicipios(search?: string, page: number = 1, limit: number = 10): Promise<MunicipiosResponse> {
  const params: any = { page, limit };
  if (search && search.trim()) {
    params.search = search.trim();
  }
  const { data } = await api.get<MunicipiosResponse>("/municipios", { params });
  return data;
}

export function useMunicipios(search?: string, page: number = 1, limit: number = 10, enabled: boolean = true) {
  return useQuery({
    queryKey: ["municipios", search, page, limit],
    queryFn: () => getMunicipios(search, page, limit),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}