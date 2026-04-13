import { api } from "./axios";
import type {
  AgrupacionesResponse,
  AgrupacionesParams,
  CreateAgrupacionDto,
  UpdateAgrupacionDto,
  Agrupacion,
} from "@/lib/types/agrupacion";

export async function getAgrupaciones(params: AgrupacionesParams): Promise<AgrupacionesResponse> {
  const { data } = await api.get<AgrupacionesResponse>("/agrupaciones", { params });
  return data;
}

export async function createAgrupacion(dto: CreateAgrupacionDto): Promise<Agrupacion> {
  const { data } = await api.post("/agrupaciones", dto);
  return data;
}

export async function updateAgrupacion(id: number, dto: UpdateAgrupacionDto): Promise<Agrupacion> {
  const { data } = await api.patch(`/agrupaciones/${id}`, dto);
  return data;
}

export async function exportarAgrupaciones(procesoId: number): Promise<Blob> {
  const { data } = await api.get("/agrupaciones/exportar", {
    params: { procesoId },
    responseType: "blob",
  });
  return data;
}

export async function deleteAgrupacion(id: number): Promise<void> {
  await api.delete(`/agrupaciones/${id}`);
}