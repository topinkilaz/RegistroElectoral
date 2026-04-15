import { api } from "./axios";
import type { JefeRecinto, CreateJefeRecintoDto, UpdateJefeRecintoDto, MisDatosJefeRecinto } from "@/lib/types/jefe-recinto";

export async function registrarJefeRecinto(dto: CreateJefeRecintoDto): Promise<JefeRecinto> {
  const { data } = await api.post("/jefe-recinto/registrar", dto);
  return data;
}

export async function actualizarJefeRecinto(id: number, dto: UpdateJefeRecintoDto): Promise<JefeRecinto> {
  const { data } = await api.patch(`/jefe-recinto/${id}`, dto);
  return data;
}

export async function eliminarJefeRecinto(id: number): Promise<void> {
  await api.delete(`/jefe-recinto/${id}`);
}
export async function convertirJefeADelegado(id: number, data: { tipo: string; mesaId?: number; enGrupoWhatsapp?: boolean; tieneFotocopiaCarnet?: boolean; agrupacionId?: number }): Promise<any> {
  const { data: response } = await api.post(`/jefe-recinto/${id}/convertir-a-delegado`, data);
  return response;
}

export async function getMisDatosJefeRecinto(): Promise<MisDatosJefeRecinto[]> {
  const { data } = await api.get<MisDatosJefeRecinto[]>("/jefe-recinto/mis-datos");
  return data;
}