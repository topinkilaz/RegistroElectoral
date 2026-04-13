import { api } from "./axios";
import type {
  DistritosResponse,
  CreateDistritoDto,
  UpdateDistritoDto,
  DistritoMunicipal,
} from "@/lib/types/distritos";

export async function getDistritos(): Promise<DistritosResponse> {
  const { data } = await api.get<DistritosResponse>("/distritos-municipales");
  return data;
}

export async function createDistrito(dto: CreateDistritoDto): Promise<DistritoMunicipal> {
  const { data } = await api.post("/distritos-municipales", dto);
  return data;
}

export async function updateDistrito(id: number, dto: UpdateDistritoDto): Promise<DistritoMunicipal> {
  const { data } = await api.patch(`/distritos-municipales/${id}`, dto);
  return data;
}

export async function deleteDistrito(id: number): Promise<void> {
  await api.delete(`/distritos-municipales/${id}`);
}