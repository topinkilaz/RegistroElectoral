import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";

export interface DepartamentoRelacion {
  id: number;
  nombre: string;
}

export interface Provincia {
  id: number;
  nombre: string;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  eliminado: boolean;
  procesoId: number;
  departamento: DepartamentoRelacion;
}

export interface ProvinciasResponse {
  statusCode: number;
  message: string;
  data: Provincia[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export async function getProvincias(search?: string, page: number = 1, limit: number = 10): Promise<ProvinciasResponse> {
  const params: any = { page, limit };
  if (search && search.trim()) {
    params.search = search.trim();
  }
  const { data } = await api.get<ProvinciasResponse>("/provincias", { params });
  return data;
}

export function useProvincias(search?: string, page: number = 1, limit: number = 10, enabled: boolean = true) {
  return useQuery({
    queryKey: ["provincias", search, page, limit],
    queryFn: () => getProvincias(search, page, limit),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}