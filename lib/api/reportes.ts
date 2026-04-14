import { api } from "./axios";
import type {
  ReporteResultadoParams,
  ReporteResultadoResponse,
} from "@/lib/types/reporte";

export async function getReporteResultado(
  params: ReporteResultadoParams
): Promise<ReporteResultadoResponse> {
  const body = {
    procesoId: params.procesoId,
    provinciaId: params.provinciaId || 0,
    circunscripcionId: params.circunscripcionId || 0,
    municipioId: params.municipioId || 0,
    distritoId: params.distritoId || 0,
    localidadId: params.localidadId || 0,
  };

  const { data } = await api.post<ReporteResultadoResponse>(
    "/reportes/data/informacion/resultado",
    body
  );
  return data;
}
