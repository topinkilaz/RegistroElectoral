import { api } from "./axios";
import type { DelegadoMesa, CreateDelegadoMesaDto, UpdateDelegadoMesaDto, MisDatosDelegado } from "@/lib/types/delegado-mesa";

export async function registrarDelegadoMesa(dto: CreateDelegadoMesaDto): Promise<DelegadoMesa> {
  const { data } = await api.post("/delegado-mesa/registrar", dto);
  return data;
}

export async function actualizarDelegadoMesa(id: number, dto: UpdateDelegadoMesaDto): Promise<DelegadoMesa> {
  const { data } = await api.patch(`/delegado-mesa/${id}`, dto);
  return data;
}

export async function eliminarDelegadoMesa(id: number): Promise<void> {
  await api.delete(`/delegado-mesa/${id}`);
}
export async function convertirDelegadoAJefe(id: number, data: { tipo: string; enGrupoWhatsapp?: boolean; tieneFotocopiaCarnet?: boolean; agrupacionId?: number }): Promise<any> {
  const { data: response } = await api.post(`/delegado-mesa/${id}/convertir-a-jefe`, data);
  return response;
}

export async function getMisDatosDelegado(): Promise<MisDatosDelegado[]> {
  const { data } = await api.get<MisDatosDelegado[]>("/delegado-mesa/mis-datos");
  return data;
}