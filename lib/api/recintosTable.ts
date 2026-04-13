import { api } from "./axios";
import type {
  RecintosResponse,
  RecintosParams,
  CreateRecintoDto,
  UpdateRecintoDto,
  Recinto,
  CambiarEstadoRecintoDto,
} from "@/lib/types/recintosTable";

export async function getRecintos(params?: RecintosParams): Promise<RecintosResponse> {
  const { data } = await api.get<RecintosResponse>("/recintos", { params });
  return data;
}

export async function createRecinto(dto: CreateRecintoDto): Promise<Recinto> {
  const { data } = await api.post("/recintos", dto);
  return data;
}

export async function updateRecinto(id: number, dto: UpdateRecintoDto): Promise<Recinto> {
  const { data } = await api.patch(`/recintos/${id}`, dto);
  return data;
}

export async function cambiarEstadoRecinto(id: number, dto: CambiarEstadoRecintoDto): Promise<Recinto> {
  const { data } = await api.patch(`/recintos/${id}/cambiar-estado`, dto);
  return data;
}

export async function deleteRecinto(id: number): Promise<void> {
  await api.delete(`/recintos/${id}`);
}