import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";

export interface PaisRelacion {
  id: number;
  nombre: string;
}

export interface Departamento {
  id: number;
  nombre: string;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  eliminado: boolean;
  procesoId: number;
  pais: PaisRelacion;
}

export interface DepartamentosResponse {
  statusCode: number;
  message: string;
  data: Departamento[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export async function getDepartamentos(search?: string, page: number = 1, limit: number = 10): Promise<DepartamentosResponse> {
  const params: any = { page, limit };
  if (search && search.trim()) {
    params.search = search.trim();
  }
  const { data } = await api.get<DepartamentosResponse>("/departamentos", { params });
  return data;
}

export function useDepartamentos(search?: string, page: number = 1, limit: number = 10, enabled: boolean = true) {
  return useQuery({
    queryKey: ["departamentos", search, page, limit],
    queryFn: () => getDepartamentos(search, page, limit),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}