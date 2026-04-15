import { api } from "./axios";
import type {
  ReporteDuplicadosParams,
  ReporteDuplicadosResponse,
} from "@/lib/types/reporteDuplicados";

export async function getReporteDuplicados(
  params: ReporteDuplicadosParams
): Promise<ReporteDuplicadosResponse> {
  const { data } = await api.post<ReporteDuplicadosResponse>(
    "/reportes/data/informacion/duplicados",
    {
      procesoId: params.procesoId,
      tipo: params.tipo,
      orden: params.orden,
      campoDuplicado: params.campoDuplicado,
    }
  );
  return data;
}