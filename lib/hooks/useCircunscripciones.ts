import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/axios";

export interface Circunscripcion {
  id: number;
  numero: string;
  procesoId: number;
  departamentoId: number;
  municipioId: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  eliminado: boolean;
  createdBy: number;
}

export async function getCircunscripciones(procesoId?: number): Promise<Circunscripcion[]> {
  const params = procesoId ? { procesoId } : {};
  const { data } = await api.get<Circunscripcion[]>("/circunscripcion", { params });
  return data;
}

export function useCircunscripciones(procesoId?: number, enabled: boolean = true) {
  return useQuery({
    queryKey: ["circunscripciones", procesoId],
    queryFn: () => getCircunscripciones(procesoId),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}