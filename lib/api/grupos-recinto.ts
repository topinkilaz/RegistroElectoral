import { api } from "./axios";
import type {
  GrupoRecinto,
  CreateGrupoRecintoDto,
  UpdateGrupoRecintoDto,
  AsignarRecintosDto,
} from "@/lib/types/grupo-recinto";

export async function getGruposRecinto(procesoId?: number): Promise<GrupoRecinto[]> {
  const params = procesoId ? { procesoId } : {};
  const { data } = await api.get<GrupoRecinto[]>("/grupos-recinto", { params });
  return data;
}

export async function getGrupoRecintoById(id: number): Promise<GrupoRecinto> {
  const { data } = await api.get<GrupoRecinto>(`/grupos-recinto/${id}`);
  return data;
}

export async function crearGrupoRecinto(dto: CreateGrupoRecintoDto): Promise<GrupoRecinto> {
  const { data } = await api.post<GrupoRecinto>("/grupos-recinto", dto);
  return data;
}

export async function actualizarGrupoRecinto(
  id: number,
  dto: UpdateGrupoRecintoDto
): Promise<GrupoRecinto> {
  const { data } = await api.patch<GrupoRecinto>(`/grupos-recinto/${id}`, dto);
  return data;
}

export async function asignarRecintosAGrupo(
  grupoId: number,
  dto: AsignarRecintosDto
): Promise<GrupoRecinto> {
  const { data } = await api.post<GrupoRecinto>(
    `/grupos-recinto/${grupoId}/recintos`,
    dto
  );
  return data;
}

export async function quitarRecintosDeGrupo(grupoId: number): Promise<void> {
  await api.delete(`/grupos-recinto/${grupoId}/recintos`);
}

export async function eliminarGrupoRecinto(id: number): Promise<void> {
  await api.delete(`/grupos-recinto/${id}`);
}
