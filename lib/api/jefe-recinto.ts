import { api } from "./axios";
import type { JefeRecinto, CreateJefeRecintoDto } from "@/lib/types/jefe-recinto";

export async function registrarJefeRecinto(dto: CreateJefeRecintoDto): Promise<JefeRecinto> {
  const { data } = await api.post("/jefe-recinto/registrar", dto);
  return data;
}

export async function eliminarJefeRecinto(id: number): Promise<void> {
  await api.delete(`/jefe-recinto/${id}`);
}
