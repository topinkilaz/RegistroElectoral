import { api } from "./axios";
import type { RecintosResponse, RecintosParams } from "@/lib/types/recinto";

export async function getRecintosPorUsuario(
  usuarioId: number,
  params: RecintosParams
): Promise<RecintosResponse> {
  const { data } = await api.get<RecintosResponse>(
    `/usuario-alcance/usuario/${usuarioId}/recintos`,
    { params }
  );
  return data;
}