import { api } from "./axios";
import type { DelegadoMesa, CreateDelegadoMesaDto } from "@/lib/types/delegado-mesa";

export async function registrarDelegadoMesa(dto: CreateDelegadoMesaDto): Promise<DelegadoMesa> {
  const { data } = await api.post("/delegado-mesa/registrar", dto);
  return data;
}

export async function eliminarDelegadoMesa(id: number): Promise<void> {
  await api.delete(`/delegado-mesa/${id}`);
}
